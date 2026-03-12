'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import ProfilePhotoUpload from '@/components/ui/ProfilePhotoUpload';
import SmartSearchDropdown from '@/components/ui/SmartSearchDropdown';
import {
  FiUser, FiLogOut, FiEdit2, FiFileText, FiCreditCard, FiZap,
  FiCalendar, FiChevronRight, FiRefreshCw, FiCamera, FiBriefcase,
  FiBook, FiSettings, FiCheckCircle, FiAlertCircle, FiShield, FiArrowLeft,
  FiPlus, FiTrash2, FiLock, FiEye, FiEyeOff, FiX,
} from 'react-icons/fi';
import { JOB_DOMAINS, getJobDomainName } from '@/lib/constants/jobDomains';
import {
  YEARS_OF_EXPERIENCE,
  EMPLOYMENT_STATUS,
  NATIONALITIES,
  getDropdownLabel,
} from '@/lib/constants/profileOptions';

const formatUserDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const MONTHS = [
  { value: 'January', en: 'January', ar: 'يناير' },
  { value: 'February', en: 'February', ar: 'فبراير' },
  { value: 'March', en: 'March', ar: 'مارس' },
  { value: 'April', en: 'April', ar: 'أبريل' },
  { value: 'May', en: 'May', ar: 'مايو' },
  { value: 'June', en: 'June', ar: 'يونيو' },
  { value: 'July', en: 'July', ar: 'يوليو' },
  { value: 'August', en: 'August', ar: 'أغسطس' },
  { value: 'September', en: 'September', ar: 'سبتمبر' },
  { value: 'October', en: 'October', ar: 'أكتوبر' },
  { value: 'November', en: 'November', ar: 'نوفمبر' },
  { value: 'December', en: 'December', ar: 'ديسمبر' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function parseStartDate(sd: string): { month: string; year: string } {
  if (!sd) return { month: '', year: '' };
  const parts = sd.split(' ');
  if (parts.length >= 2) {
    const m = MONTHS.find(mo => mo.value.toLowerCase() === parts[0].toLowerCase());
    return { month: m ? m.value : '', year: parts[parts.length - 1] };
  }
  if (/^\d{4}$/.test(sd)) return { month: '', year: sd };
  return { month: '', year: sd };
}

interface EduEntry {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface ExpEntry {
  company: string;
  position: string;
  city: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
  description: string;
}

function normalizeEdu(raw: any): EduEntry {
  return {
    institution: raw.institution || raw.school || '',
    degree: raw.degree || '',
    field: raw.field || raw.fieldOfStudy || '',
    startYear: raw.startDate || raw.start_date || raw.startYear || '',
    endYear: raw.endDate || raw.end_date || raw.graduationYear || raw.endYear || '',
    description: stripHtml(raw.description || raw.summary || ''),
  };
}

function normalizeExp(raw: any): ExpEntry {
  const sd = parseStartDate(raw.startDate || raw.start_date || '');
  const isPresent = (raw.endDate || '').toLowerCase() === 'present' || raw.isCurrent === true;
  const ed = isPresent ? { month: '', year: '' } : parseStartDate(raw.endDate || raw.end_date || '');
  return {
    company: raw.company || '',
    position: raw.position || raw.title || '',
    city: raw.city || raw.location || '',
    startMonth: sd.month,
    startYear: sd.year,
    endMonth: ed.month,
    endYear: ed.year,
    isCurrent: isPresent,
    description: stripHtml(raw.description || ''),
  };
}

const emptyEdu = (): EduEntry => ({ institution: '', degree: '', field: '', startYear: '', endYear: '', description: '' });
const emptyExp = (): ExpEntry => ({ company: '', position: '', city: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false, description: '' });

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout, refreshUser, loggingOut } = useAuth();
  const { t, isRTL } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [cvCount, setCvCount] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [syncingFromCV, setSyncingFromCV] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCvSelectModal, setShowCvSelectModal] = useState(false);
  const [allCvsList, setAllCvsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'privacy'>('profile');
  const [mounted, setMounted] = useState(false);

  const [cvEducation, setCvEducation] = useState<EduEntry[]>([]);
  const [cvExperience, setCvExperience] = useState<ExpEntry[]>([]);
  const [activeCvId, setActiveCvId] = useState<number | null>(null);
  const [rawPersonalInfo, setRawPersonalInfo] = useState<any>(null);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const normalizeLinkedInUrl = (url: string): { normalized: string; isValid: boolean } => {
    const trimmed = url.trim();
    if (!trimmed) return { normalized: '', isValid: true };
    let fullUrl = trimmed;
    if (!trimmed.match(/^https?:\/\//i)) fullUrl = 'https://' + trimmed;
    try {
      const urlObj = new URL(fullUrl);
      const host = urlObj.host.toLowerCase();
      const isLinkedIn = host === 'linkedin.com' || host === 'www.linkedin.com';
      if (!isLinkedIn || !urlObj.pathname || urlObj.pathname === '/') return { normalized: trimmed, isValid: false };
      return { normalized: `https://www.linkedin.com${urlObj.pathname}${urlObj.search}${urlObj.hash}`, isValid: true };
    } catch { return { normalized: trimmed, isValid: false }; }
  };

  const extractCvFields = useCallback((cv: any, useArabic: boolean) => {
    if (!cv) return null;

    const raw = cv.personalInfo || {};
    let pi: any = {};
    try { pi = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { pi = raw || {}; }

    // Strict language separation — no cross-language fallback
    const langContent = useArabic ? (pi.arabicContent || {}) : (pi.englishContent || {});
    const langPI = langContent.personalInfo || {};

    // Use only language-specific content for repeater fields — no cross-language fallback
    const education = langContent.education || [];
    const experience = langContent.experience || [];

    const hasExperience = Array.isArray(experience) && experience.some((e: any) => e.company || e.position || e.title);
    const inferredStatus = hasExperience ? 'employed' : 'student';

    console.log('[SyncFromCV] CV ID:', cv.id, '| Title:', cv.title, '| Language:', useArabic ? 'ar' : 'en');
    console.log('[SyncFromCV] Education entries:', education.length, '| Experience entries:', experience.length);

    return {
      cvId: cv.id,
      cvTitle: cv.title || 'CV',
      rawPi: pi,
      fullName: langPI.fullName || pi.fullName || pi.name || '',
      phone: langPI.phone || pi.phone || pi.phoneNumber || '',
      location: langPI.location || pi.location || '',
      nationality: langPI.nationality || pi.nationality || '',
      linkedin: langPI.linkedin || pi.linkedin || '',
      targetJobDomain: langPI.targetJobDomain || pi.targetJobDomain || '',
      targetJobTitle: langPI.targetJobTitle || pi.targetJobTitle || '',
      yearsOfExperience: langPI.yearsOfExperience || pi.yearsOfExperience || '',
      employmentStatus: inferredStatus,
      education: Array.isArray(education) ? education.filter((e: any) => e.institution || e.school || e.degree).map(normalizeEdu) : [],
      experience: Array.isArray(experience) ? experience.filter((e: any) => e.company || e.position || e.title).map(normalizeExp) : [],
    };
  }, []);

  const doSync = (cv: any) => {
    const extracted = extractCvFields(cv, isRTL);
    if (!extracted) {
      setSyncMessage({ type: 'error', text: isRTL ? 'تعذّر استخراج البيانات' : 'Could not extract CV data' });
      return;
    }
    const safeVal = (cvVal: string | undefined, existing: string) => (cvVal && cvVal.trim()) ? cvVal.trim() : existing;
    setFormData((prev: any) => ({
      ...prev,
      fullName: safeVal(extracted.fullName, prev.fullName),
      phoneNumber: safeVal(extracted.phone, prev.phoneNumber),
      location: safeVal(extracted.location, prev.location),
      nationality: safeVal(extracted.nationality, prev.nationality),
      linkedin: safeVal(extracted.linkedin, prev.linkedin),
      targetJobDomain: safeVal(extracted.targetJobDomain, prev.targetJobDomain),
      mostRecentJobTitle: safeVal(extracted.targetJobTitle, prev.mostRecentJobTitle),
      yearsOfExperience: safeVal(extracted.yearsOfExperience, prev.yearsOfExperience),
      employmentStatus: safeVal(extracted.employmentStatus, prev.employmentStatus),
    }));
    if (extracted.education.length > 0) setCvEducation(extracted.education);
    if (extracted.experience.length > 0) setCvExperience(extracted.experience);
    setActiveCvId(extracted.cvId);
    setRawPersonalInfo(extracted.rawPi);
    console.log('[SyncFromCV] Sync complete from CV:', extracted.cvTitle, '(ID:', extracted.cvId, ')');
    const cvTitle = extracted.cvTitle;
    setSyncMessage({
      type: 'success',
      text: isRTL
        ? `تم تحديث الملف الشخصي من "${cvTitle}" بنجاح!`
        : `Profile updated successfully from "${cvTitle}"`,
    });
    setTimeout(() => setSyncMessage(null), 5000);
  };

  const handleSyncFromCV = async () => {
    setSyncingFromCV(true);
    setSyncMessage(null);
    try {
      const response = await axios.get('/api/cvs', { headers: { Authorization: `Bearer ${token}` } });
      const cvs = (response.data.cvs || response.data) as any[];
      if (!cvs || cvs.length === 0) {
        setSyncMessage({ type: 'error', text: isRTL ? 'لم يتم العثور على سيرة ذاتية' : 'No CV found' });
        return;
      }
      if (cvs.length === 1) {
        doSync(cvs[0]);
      } else {
        const sorted = [...cvs].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setAllCvsList(sorted);
        setShowCvSelectModal(true);
      }
    } catch {
      setSyncMessage({ type: 'error', text: isRTL ? 'فشلت مزامنة البيانات' : 'Failed to sync data' });
    } finally {
      setSyncingFromCV(false);
    }
  };

  const handleLinkedInBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      const result = normalizeLinkedInUrl(url);
      if (result.isValid && result.normalized !== url) setFormData({ ...formData, linkedin: result.normalized });
    }
  };

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) router.push('/auth/login');
    else if (!authLoading && user && !user.onboardingCompleted) router.push('/onboarding');
    else if (user) {
      const u = user as any;
      setFormData({
        fullName: u.fullName || '',
        phoneNumber: u.phoneNumber || '',
        location: u.location || '',
        nationality: u.nationality || '',
        linkedin: u.linkedin || '',
        targetJobDomain: u.targetJobDomain || u.targetJobTitle || '',
        yearsOfExperience: u.yearsOfExperience || '',
        mostRecentJobTitle: u.mostRecentJobTitle || '',
        mostRecentCompany: u.mostRecentCompany || '',
        employmentStatus: u.employmentStatus || '',
      });
      setCreditsRemaining(u.freeCredits ?? null);
      fetchUserStats();
      fetchCvData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!rawPersonalInfo || !activeCvId) return;
    const pi = rawPersonalInfo;
    const langContent = isRTL ? (pi.arabicContent || {}) : (pi.englishContent || {});
    const education = langContent.education || [];
    const experience = langContent.experience || [];
    const normalizedEdu = Array.isArray(education) ? education.filter((e: any) => e.institution || e.school || e.degree).map(normalizeEdu) : [];
    const normalizedExp = Array.isArray(experience) ? experience.filter((e: any) => e.company || e.position || e.title).map(normalizeExp) : [];
    setCvEducation(normalizedEdu.length > 0 ? normalizedEdu : [emptyEdu()]);
    setCvExperience(normalizedExp.length > 0 ? normalizedExp : [emptyExp()]);
    console.log('[Settings] Language changed to', isRTL ? 'ar' : 'en', '- re-extracted education:', normalizedEdu.length, 'experience:', normalizedExp.length);
  }, [isRTL, rawPersonalInfo, activeCvId]);

  const fetchUserStats = async () => {
    try {
      const res = await axios.get('/api/user/stats', { headers: { Authorization: `Bearer ${token}` } });
      setCvCount(res.data.cvCount || 0);
      setTotalGenerations(res.data.cvGenerations || 0);
    } catch {}
  };

  const fetchCvData = async () => {
    try {
      const res = await axios.get('/api/cvs', { headers: { Authorization: `Bearer ${token}` } });
      const cvs = res.data.cvs || res.data;
      if (!cvs || cvs.length === 0) return;
      const sorted = [...cvs].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const sourceCv = sorted[0];
      const extracted = extractCvFields(sourceCv, isRTL);
      if (extracted) {
        setCvEducation(extracted.education);
        setCvExperience(extracted.experience);
        setActiveCvId(extracted.cvId);
        setRawPersonalInfo(extracted.rawPi);
        if (!formData?.employmentStatus) {
          setFormData((prev: any) => prev ? { ...prev, employmentStatus: prev.employmentStatus || extracted.employmentStatus } : prev);
        }
      }
    } catch {}
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateEdu = (idx: number, field: keyof EduEntry, value: string) => {
    setCvEducation(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };
  const addEdu = () => setCvEducation(prev => [...prev, emptyEdu()]);
  const removeEdu = (idx: number) => setCvEducation(prev => prev.filter((_, i) => i !== idx));

  const updateExp = (idx: number, field: keyof ExpEntry, value: string | boolean) => {
    setCvExperience(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };
  const addExp = () => setCvExperience(prev => [...prev, emptyExp()]);
  const removeExp = (idx: number) => setCvExperience(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      await axios.put('/api/profile/update', formData, { headers: { Authorization: `Bearer ${token}` } });

      if (activeCvId && rawPersonalInfo) {
        const eduForSave = cvEducation.filter(e => e.institution || e.degree).map(e => ({
          institution: e.institution, school: e.institution,
          degree: e.degree, field: e.field, fieldOfStudy: e.field,
          startDate: e.startYear, endDate: e.endYear, graduationYear: e.endYear,
          description: e.description,
        }));
        const expForSave = cvExperience.filter(e => e.company || e.position).map(e => ({
          company: e.company, position: e.position, title: e.position,
          location: e.city, city: e.city,
          startDate: e.startMonth ? `${e.startMonth} ${e.startYear}` : e.startYear,
          endDate: e.isCurrent ? 'Present' : (e.endMonth ? `${e.endMonth} ${e.endYear}` : e.endYear),
          isCurrent: e.isCurrent,
          description: e.description,
        }));

        const updatedPi = JSON.parse(JSON.stringify(rawPersonalInfo));
        updatedPi.education = eduForSave;
        updatedPi.experience = expForSave;

        if (updatedPi.englishContent) {
          updatedPi.englishContent.education = eduForSave;
          updatedPi.englishContent.experience = expForSave;
        }
        if (updatedPi.arabicContent) {
          updatedPi.arabicContent.education = eduForSave;
          updatedPi.arabicContent.experience = expForSave;
        }

        await axios.put(`/api/cvs/${activeCvId}`, { personalInfo: updatedPi }, { headers: { Authorization: `Bearer ${token}` } });
        setRawPersonalInfo(updatedPi);
      }

      await refreshUser();
      setIsEditing(false);
      setSuccessMessage(isRTL ? 'تم حفظ الملف الشخصي بنجاح' : 'Profile saved successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage(isRTL ? 'فشل حفظ الملف الشخصي' : 'Failed to save profile');
    } finally { setIsSaving(false); }
  };

  const handleLogout = () => { logout(); router.push('/'); };

  const handleChangePassword = async () => {
    setPwMessage(null);
    if (!passwordData.newPassword || !passwordData.currentPassword) {
      setPwMessage({ type: 'error', text: isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPwMessage({ type: 'error', text: isRTL ? 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' : 'New password must be at least 8 characters' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwMessage({ type: 'error', text: isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match' });
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPwMessage({ type: 'error', text: isRTL ? 'كلمة المرور الجديدة يجب أن تكون مختلفة' : 'New password must be different from current password' });
      return;
    }
    setChangingPassword(true);
    try {
      await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setPwMessage({ type: 'success', text: isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMessage(null), 5000);
    } catch (err: any) {
      const msg = err.response?.data?.error || (isRTL ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
      setPwMessage({ type: 'error', text: msg });
    } finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
      return;
    }
    setDeletingAccount(true);
    setDeleteError('');
    try {
      await axios.post('/api/account/delete', { password: deletePassword }, { headers: { Authorization: `Bearer ${token}` } });
      logout();
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || (isRTL ? 'فشل حذف الحساب' : 'Failed to delete account');
      setDeleteError(msg);
    } finally { setDeletingAccount(false); }
  };

  if (authLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const jobDomainOptions = JOB_DOMAINS.map(d => ({ value: d.id, labelEn: d.nameEn, labelAr: d.nameAr, keywords: d.keywords }));

  const tierLabel = (tier: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      free: { en: 'Free', ar: 'مجاني' }, regular: { en: 'Regular', ar: 'عادي' },
      plus: { en: 'Plus', ar: 'بلس' }, premium: { en: 'Premium', ar: 'مميز' },
      annual: { en: 'Annual', ar: 'سنوي' }, lifetime: { en: 'Lifetime', ar: 'مدى الحياة' },
      admin: { en: 'Admin', ar: 'مدير' },
    };
    return labels[tier]?.[isRTL ? 'ar' : 'en'] || tier;
  };

  const tierColor = (tier: string) => {
    if (tier === 'free') return 'bg-gray-100 text-gray-700';
    if (tier === 'admin') return 'bg-red-100 text-red-700';
    return 'bg-accent-100 text-accent-700';
  };

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all duration-200';
  const selectCls = `${inputCls} appearance-none`;
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';
  const displayCls = 'bg-gray-50/80 rounded-xl p-4 border border-gray-100';
  const sectionCardCls = 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden';

  const tabs = [
    { id: 'profile' as const, label: isRTL ? 'الملف الشخصي' : 'Profile', icon: FiUser },
    { id: 'subscription' as const, label: isRTL ? 'الاشتراك' : 'Subscription', icon: FiCreditCard },
    { id: 'privacy' as const, label: isRTL ? 'الخصوصية' : 'Privacy', icon: FiShield },
  ];

  const displayItems = (items: { label: string; value: string; isLink?: boolean }[]) => {
    const nonEmpty = items.filter(item => item.value && item.value.trim());
    if (nonEmpty.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nonEmpty.map((item, i) => (
          <div key={i} className={displayCls}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
            {item.isLink ? (
              <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent-600 hover:underline truncate block">{item.value}</a>
            ) : (
              <p className="text-sm font-semibold text-navy-900">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEduDisplay = (edu: EduEntry, i: number) => {
    if (!edu.institution && !edu.degree) return null;
    return (
      <div key={i} className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
        {edu.degree && (
          <p className="text-sm font-bold text-navy-900">{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</p>
        )}
        {edu.institution && <p className="text-sm text-gray-600 mt-0.5">{edu.institution}</p>}
        {(edu.startYear || edu.endYear) && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            {edu.startYear}{edu.startYear && edu.endYear ? ' — ' : ''}{edu.endYear}
          </p>
        )}
        {edu.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{edu.description}</p>}
      </div>
    );
  };

  const renderEduEdit = (edu: EduEntry, i: number) => (
    <div key={i} className="bg-gray-50/50 rounded-xl p-5 border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-navy-800">{isRTL ? `المؤهل ${i + 1}` : `Qualification ${i + 1}`}</span>
        {cvEducation.length > 1 && (
          <button onClick={() => removeEdu(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div>
        <label className={labelCls}>{isRTL ? 'المؤسسة التعليمية' : 'Institution'}</label>
        <input type="text" value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} className={inputCls} placeholder={isRTL ? 'مثال: جامعة الملك سعود' : 'e.g., King Saud University'} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{isRTL ? 'الدرجة العلمية' : 'Degree'}</label>
          <input type="text" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} className={inputCls} placeholder={isRTL ? 'مثال: بكالوريوس' : 'e.g., Bachelor of Science'} />
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'التخصص' : 'Field of Study'}</label>
          <input type="text" value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} className={inputCls} placeholder={isRTL ? 'مثال: إدارة الأعمال' : 'e.g., Business Administration'} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{isRTL ? 'سنة البداية' : 'Start Year'}</label>
          <select value={edu.startYear} onChange={e => updateEdu(i, 'startYear', e.target.value)} className={selectCls}>
            <option value="">{isRTL ? 'اختر' : 'Select'}</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'سنة التخرج' : 'Graduation Year'}</label>
          <select value={edu.endYear} onChange={e => updateEdu(i, 'endYear', e.target.value)} className={selectCls}>
            <option value="">{isRTL ? 'اختر' : 'Select'}</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>{isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}</label>
        <textarea value={edu.description} onChange={e => updateEdu(i, 'description', e.target.value)} rows={3} className={inputCls} placeholder={isRTL ? 'أضف تفاصيل عن دراستك...' : 'Add details about your studies, projects, or academic achievements...'} />
      </div>
    </div>
  );

  const renderExpDisplay = (exp: ExpEntry, i: number) => {
    if (!exp.company && !exp.position) return null;
    const startStr = exp.startMonth ? `${exp.startMonth} ${exp.startYear}` : exp.startYear;
    const endStr = exp.isCurrent ? (isRTL ? 'حتى الآن' : 'Present') : (exp.endMonth ? `${exp.endMonth} ${exp.endYear}` : exp.endYear);
    return (
      <div key={i} className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
        {exp.position && (
          <p className="text-sm font-bold text-navy-900">{exp.position}{exp.company ? ` ${isRTL ? 'في' : 'at'} ${exp.company}` : ''}</p>
        )}
        {!exp.position && exp.company && <p className="text-sm font-bold text-navy-900">{exp.company}</p>}
        {exp.city && <p className="text-xs text-gray-500 mt-0.5">{exp.city}</p>}
        {(startStr || endStr) && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            {startStr}{startStr && endStr ? ' — ' : ''}{endStr}
          </p>
        )}
        {exp.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>}
      </div>
    );
  };

  const renderExpEdit = (exp: ExpEntry, i: number) => (
    <div key={i} className="bg-gray-50/50 rounded-xl p-5 border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-navy-800">{isRTL ? `الوظيفة ${i + 1}` : `Position ${i + 1}`}</span>
        {cvExperience.length > 1 && (
          <button onClick={() => removeExp(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div>
        <label className={labelCls}>{isRTL ? 'اسم الشركة' : 'Company Name'}</label>
        <input type="text" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} className={inputCls} placeholder={isRTL ? 'مثال: أرامكو' : 'e.g., Saudi Aramco'} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{isRTL ? 'المسمى الوظيفي' : 'Job Title'}</label>
          <input type="text" value={exp.position} onChange={e => updateExp(i, 'position', e.target.value)} className={inputCls} placeholder={isRTL ? 'مثال: محلل' : 'e.g., Analyst'} />
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'المدينة' : 'City'}</label>
          <input type="text" value={exp.city} onChange={e => updateExp(i, 'city', e.target.value)} className={inputCls} placeholder={isRTL ? 'مثال: الرياض' : 'e.g., Riyadh'} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>{isRTL ? 'شهر البداية' : 'Start Month'}</label>
          <select value={exp.startMonth} onChange={e => updateExp(i, 'startMonth', e.target.value)} className={selectCls}>
            <option value="">{isRTL ? 'الشهر' : 'Month'}</option>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{isRTL ? m.ar : m.en}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'سنة البداية' : 'Start Year'}</label>
          <select value={exp.startYear} onChange={e => updateExp(i, 'startYear', e.target.value)} className={selectCls}>
            <option value="">{isRTL ? 'السنة' : 'Year'}</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'شهر النهاية' : 'End Month'}</label>
          <select value={exp.endMonth} onChange={e => updateExp(i, 'endMonth', e.target.value)} disabled={exp.isCurrent} className={`${selectCls} ${exp.isCurrent ? 'opacity-50' : ''}`}>
            <option value="">{isRTL ? 'الشهر' : 'Month'}</option>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{isRTL ? m.ar : m.en}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{isRTL ? 'سنة النهاية' : 'End Year'}</label>
          <select value={exp.endYear} onChange={e => updateExp(i, 'endYear', e.target.value)} disabled={exp.isCurrent} className={`${selectCls} ${exp.isCurrent ? 'opacity-50' : ''}`}>
            <option value="">{isRTL ? 'السنة' : 'Year'}</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={exp.isCurrent} onChange={e => updateExp(i, 'isCurrent', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500" />
        <span className="text-sm text-gray-600">{isRTL ? 'أعمل هنا حالياً' : 'Present (I currently work here)'}</span>
      </label>
      <div>
        <label className={labelCls}>{isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}</label>
        <textarea value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} rows={4} className={inputCls} placeholder={isRTL ? 'صف مسؤولياتك وإنجازاتك...' : 'Describe your responsibilities and achievements...'} />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="settings-blob-1 absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500 rounded-full filter blur-[200px] opacity-[0.07]" />
          <div className="settings-blob-2 absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-cyan-500 rounded-full filter blur-[180px] opacity-[0.06]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20 sm:pb-24 relative z-10">
          <div className="transition-all duration-700" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-5 transition-colors">
              <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              {isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.08] border border-white/[0.1]">
                <FiSettings className="w-6 h-6 text-white/70" />
              </div>
              <div>
                <h1 className="font-telegraf text-2xl sm:text-3xl font-extrabold text-white">{isRTL ? 'الإعدادات والملف الشخصي' : 'Profile Settings'}</h1>
                <p className="text-sm text-white/40 mt-0.5">{isRTL ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-10 sm:-mt-12 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 flex gap-1 mb-6" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease 0.15s' }}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-navy-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {successMessage && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 flex items-center gap-3 text-sm font-medium animate-fadeIn">
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />{successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3 text-sm font-medium">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />{errorMessage}
              <button onClick={() => setErrorMessage('')} className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-red-400 hover:text-red-600`}>×</button>
            </div>
          )}
          {syncMessage && (
            <div className={`mb-5 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${syncMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {syncMessage.type === 'success' ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertCircle className="w-5 h-5" />}
              {syncMessage.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-5 pb-8">
              <div className="flex items-center justify-end">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl text-sm transition-colors">
                    <FiEdit2 className="w-4 h-4" />{isRTL ? 'تعديل الملف' : 'Edit Profile'}
                  </button>
                ) : (
                  <button onClick={handleSyncFromCV} disabled={syncingFromCV} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
                    <FiRefreshCw className={`w-4 h-4 ${syncingFromCV ? 'animate-spin' : ''}`} />
                    {isRTL ? 'مزامنة من CV' : 'Sync from CV'}
                  </button>
                )}
              </div>

              {/* Profile Photo */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-50"><FiCamera className="w-4.5 h-4.5 text-accent-600" /></div>
                  <h2 className="font-telegraf font-bold text-navy-900">{isRTL ? 'الصورة الشخصية' : 'Profile Photo'}</h2>
                </div>
                <div className="p-6">
                  <ProfilePhotoUpload currentPhotoUrl={(user as any)?.profilePicture} token={token} isRTL={isRTL} onPhotoChange={async () => { await refreshUser(); }} />
                </div>
              </div>

              {/* Personal Info */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50"><FiUser className="w-4.5 h-4.5 text-blue-600" /></div>
                  <div>
                    <h2 className="font-telegraf font-bold text-navy-900">{isRTL ? 'معلومات شخصية' : 'Personal Information'}</h2>
                    <p className="text-xs text-gray-400">{isRTL ? 'بيانات الاتصال والموقع' : 'Contact and location details'}</p>
                  </div>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input type="email" value={user?.email || ''} readOnly className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
                        <p className="text-xs text-gray-400 mt-1">{isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>{isRTL ? 'الهاتف' : 'Phone'}</label>
                          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={inputCls} placeholder="+966..." />
                        </div>
                        <div>
                          <label className={labelCls}>{isRTL ? 'الموقع' : 'Location'}</label>
                          <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={inputCls} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>{isRTL ? 'الجنسية' : 'Nationality'}</label>
                          <select name="nationality" value={formData.nationality} onChange={handleInputChange} className={selectCls}>
                            <option value="">{isRTL ? 'اختر' : 'Select'}</option>
                            {NATIONALITIES.map((n) => <option key={n.value} value={n.value}>{isRTL ? n.labelAr : n.labelEn}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>LinkedIn</label>
                          <input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} onBlur={handleLinkedInBlur} placeholder="linkedin.com/in/yourname" className={inputCls} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    displayItems([
                      { label: isRTL ? 'الاسم الكامل' : 'Full Name', value: formData.fullName },
                      { label: isRTL ? 'البريد الإلكتروني' : 'Email', value: user?.email || '' },
                      { label: isRTL ? 'الهاتف' : 'Phone', value: formData.phoneNumber },
                      { label: isRTL ? 'الموقع' : 'Location', value: formData.location },
                      { label: isRTL ? 'الجنسية' : 'Nationality', value: formData.nationality ? getDropdownLabel(NATIONALITIES, formData.nationality, isRTL ? 'ar' : 'en') : '' },
                      { label: 'LinkedIn', value: formData.linkedin, isLink: true },
                    ]) || <p className="text-sm text-gray-400 text-center py-3">{isRTL ? 'لم يتم إضافة معلومات بعد' : 'No information added yet'}</p>
                  )}
                </div>
              </div>

              {/* Professional Targeting */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-50"><FiBriefcase className="w-4.5 h-4.5 text-purple-600" /></div>
                  <div>
                    <h2 className="font-telegraf font-bold text-navy-900">{isRTL ? 'التوجه الوظيفي' : 'Professional Targeting'}</h2>
                    <p className="text-xs text-gray-400">{isRTL ? 'أهدافك ومسارك المهني' : 'Your career goals and direction'}</p>
                  </div>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>{isRTL ? 'حالة التوظيف' : 'Employment Status'}</label>
                        <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} className={selectCls}>
                          <option value="">{isRTL ? 'اختر' : 'Select'}</option>
                          {EMPLOYMENT_STATUS.map((s) => <option key={s.value} value={s.value}>{isRTL ? s.labelAr : s.labelEn}</option>)}
                        </select>
                      </div>
                      <SmartSearchDropdown options={jobDomainOptions} value={formData.targetJobDomain} onChange={(v) => setFormData({ ...formData, targetJobDomain: v })} placeholder={isRTL ? 'اختر مجال الوظيفة' : 'Select Job Domain...'} label={isRTL ? 'مجال الوظيفة المستهدف' : 'Target Job Domain'} required allowCustom />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>{isRTL ? 'سنوات الخبرة' : 'Years of Experience'}</label>
                          <select name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className={selectCls}>
                            <option value="">{isRTL ? 'اختر' : 'Select'}</option>
                            {YEARS_OF_EXPERIENCE.map((e) => <option key={e.value} value={e.value}>{isRTL ? e.labelAr : e.labelEn}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>{isRTL ? 'الموقع المفضل' : 'Preferred Location'}</label>
                          <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={inputCls} placeholder={isRTL ? 'المدينة، الدولة' : 'City, Country'} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>{isRTL ? 'آخر مسمى وظيفي' : 'Most Recent Job Title'}</label>
                          <input type="text" name="mostRecentJobTitle" value={formData.mostRecentJobTitle} onChange={handleInputChange} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>{isRTL ? 'آخر شركة' : 'Most Recent Company'}</label>
                          <input type="text" name="mostRecentCompany" value={formData.mostRecentCompany} onChange={handleInputChange} className={inputCls} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    displayItems([
                      { label: isRTL ? 'حالة التوظيف' : 'Employment Status', value: formData.employmentStatus ? getDropdownLabel(EMPLOYMENT_STATUS, formData.employmentStatus, isRTL ? 'ar' : 'en') : '' },
                      { label: isRTL ? 'مجال الوظيفة المستهدف' : 'Target Job Domain', value: formData.targetJobDomain ? getJobDomainName(formData.targetJobDomain, isRTL ? 'ar' : 'en') : '' },
                      { label: isRTL ? 'سنوات الخبرة' : 'Years of Experience', value: formData.yearsOfExperience ? getDropdownLabel(YEARS_OF_EXPERIENCE, formData.yearsOfExperience, isRTL ? 'ar' : 'en') : '' },
                      { label: isRTL ? 'الموقع المفضل' : 'Preferred Location', value: formData.location },
                      { label: isRTL ? 'آخر منصب' : 'Most Recent Position', value: formData.mostRecentJobTitle && formData.mostRecentCompany ? `${formData.mostRecentJobTitle} at ${formData.mostRecentCompany}` : (formData.mostRecentJobTitle || formData.mostRecentCompany || '') },
                    ]) || <p className="text-sm text-gray-400 text-center py-3">{isRTL ? 'لم يتم إضافة معلومات بعد' : 'No information added yet'}</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50"><FiBook className="w-4.5 h-4.5 text-amber-600" /></div>
                  <div>
                    <h2 className="font-telegraf font-bold text-navy-900">{isRTL ? 'التعليم' : 'Education'}</h2>
                    <p className="text-xs text-gray-400">{isRTL ? 'مؤهلاتك العلمية من سيرتك الذاتية' : 'Your qualifications from your CV'}</p>
                  </div>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      {cvEducation.length > 0 ? cvEducation.map((edu, i) => renderEduEdit(edu, i)) : (
                        <p className="text-sm text-gray-400 text-center py-3">{isRTL ? 'لا توجد مؤهلات. أضف واحدة أدناه.' : 'No qualifications yet. Add one below.'}</p>
                      )}
                      <button onClick={addEdu} className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-amber-300 rounded-xl text-sm font-semibold text-gray-500 hover:text-amber-700 transition-colors flex items-center justify-center gap-2">
                        <FiPlus className="w-4 h-4" />{isRTL ? 'إضافة مؤهل' : 'Add Qualification'}
                      </button>
                    </div>
                  ) : cvEducation.length > 0 ? (
                    <div className="space-y-3">{cvEducation.map((edu, i) => renderEduDisplay(edu, i))}</div>
                  ) : (
                    <div className="text-center py-6">
                      <FiBook className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">{isRTL ? 'لم يتم العثور على بيانات تعليمية. أنشئ سيرة ذاتية لعرض تعليمك هنا.' : 'No education data found. Create a CV to display your education here.'}</p>
                      <Link href="/template-gallery">
                        <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-sm transition-colors">
                          <FiFileText className="w-4 h-4" />{isRTL ? 'إنشاء سيرة ذاتية' : 'Create CV'}
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50"><FiBriefcase className="w-4.5 h-4.5 text-indigo-600" /></div>
                  <div>
                    <h2 className="font-telegraf font-bold text-navy-900">{isRTL ? 'الخبرة العملية' : 'Work Experience'}</h2>
                    <p className="text-xs text-gray-400">{isRTL ? 'تاريخك المهني من سيرتك الذاتية' : 'Your work history from your CV'}</p>
                  </div>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      {cvExperience.length > 0 ? cvExperience.map((exp, i) => renderExpEdit(exp, i)) : (
                        <p className="text-sm text-gray-400 text-center py-3">{isRTL ? 'لا توجد خبرات. أضف واحدة أدناه.' : 'No positions yet. Add one below.'}</p>
                      )}
                      <button onClick={addExp} className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-xl text-sm font-semibold text-gray-500 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <FiPlus className="w-4 h-4" />{isRTL ? 'إضافة وظيفة' : 'Add Another Position'}
                      </button>
                    </div>
                  ) : cvExperience.length > 0 ? (
                    <div className="space-y-3">{cvExperience.map((exp, i) => renderExpDisplay(exp, i))}</div>
                  ) : (
                    <div className="text-center py-6">
                      <FiBriefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">{isRTL ? 'لم يتم العثور على خبرة عملية. أنشئ سيرة ذاتية لعرض خبراتك هنا.' : 'No work experience found. Create a CV to display your experience here.'}</p>
                      <Link href="/template-gallery">
                        <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm transition-colors">
                          <FiFileText className="w-4 h-4" />{isRTL ? 'إنشاء سيرة ذاتية' : 'Create CV'}
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Stats */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-cyan-50"><FiZap className="w-4.5 h-4.5 text-cyan-600" /></div>
                  <h2 className="font-telegraf font-bold text-navy-900">{isRTL ? 'النشاطات' : 'Activity'}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: isRTL ? 'السير الذاتية' : 'CVs Created', value: cvCount, icon: <FiFileText className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
                      { label: isRTL ? 'توليد AI' : 'AI Generations', value: totalGenerations, icon: <FiZap className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
                      { label: isRTL ? 'الرصيد المتبقي' : 'Credits Left', value: user?.freeCredits || 0, icon: <FiZap className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-gray-50/80 rounded-xl p-5 border border-gray-100 text-center">
                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>{stat.icon}</div>
                        <div className="text-2xl font-extrabold text-navy-900 mb-0.5">{stat.value}</div>
                        <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save/Cancel — sticky */}
              {isEditing && (
                <div className="sticky bottom-4 z-30">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex gap-3">
                    <button onClick={() => { setIsEditing(false); setErrorMessage(''); fetchCvData(); }} className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-5 pb-8">
              <div className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[-30%] right-[-15%] w-[300px] h-[300px] bg-accent-500 rounded-full filter blur-[120px] opacity-[0.1]" />
                </div>
                <div className="relative p-7 sm:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">{isRTL ? 'خطتك الحالية' : 'Current Plan'}</p>
                      <h3 className="text-3xl font-extrabold text-white capitalize">{tierLabel(user?.subscriptionTier || 'free')}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tierColor(user?.subscriptionTier || 'free')}`}>{tierLabel(user?.subscriptionTier || 'free')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-emerald-400 font-medium">{isRTL ? 'نشط' : 'Active'}</span>
                  </div>
                  {user?.subscriptionEndDate && (
                    <div className="mb-6 flex items-center gap-2 text-white/50 text-sm">
                      <FiCalendar className="w-4 h-4" />
                      {isRTL ? 'تاريخ التجديد:' : 'Renews:'} <span className="text-white font-semibold">{formatUserDate(user.subscriptionEndDate)}</span>
                    </div>
                  )}
                  {(user?.subscriptionTier === 'free' || !user?.subscriptionTier) && (
                    <Link href="/pricing">
                      <button className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <FiCreditCard className="w-4 h-4" />{isRTL ? 'ترقية الخطة' : 'Upgrade Plan'}
                      </button>
                    </Link>
                  )}
                  {user?.subscriptionTier && user.subscriptionTier !== 'free' && (
                    <div className="py-2.5 bg-white/10 rounded-xl text-center text-sm text-white/70 font-medium">
                      {isRTL ? 'أنت على الخطة المدفوعة' : 'You are on a paid plan'}
                    </div>
                  )}
                </div>
              </div>
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-telegraf font-bold text-navy-900">{isRTL ? 'تفاصيل الحساب' : 'Account Details'}</h3>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { icon: <FiCreditCard className="w-4 h-4 text-accent-600" />, label: isRTL ? 'الخطة' : 'Plan', value: tierLabel(user?.subscriptionTier || 'free') },
                    { icon: <FiZap className="w-4 h-4 text-amber-600" />, label: isRTL ? 'رصيد الذكاء الاصطناعي' : 'AI Credits', value: `${user?.freeCredits || 0}` },
                    { icon: <FiFileText className="w-4 h-4 text-blue-600" />, label: isRTL ? 'السير الذاتية' : 'CVs Created', value: `${cvCount}` },
                    { icon: <FiCalendar className="w-4 h-4 text-purple-600" />, label: isRTL ? 'عضو منذ' : 'Member Since', value: formatUserDate(user?.createdAt) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">{item.icon}<span className="text-sm text-gray-600">{item.label}</span></div>
                      <span className="text-sm font-bold text-navy-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleLogout} className="w-full py-3.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <FiLogOut className="w-4 h-4" />{isRTL ? 'تسجيل الخروج' : 'Log Out'}
              </button>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-5 pb-8">
              {/* Change Password */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50"><FiLock className="w-4.5 h-4.5 text-blue-600" /></div>
                  <div>
                    <h3 className="font-telegraf font-bold text-navy-900">{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
                    <p className="text-xs text-gray-400">{isRTL ? 'حافظ على أمان حسابك' : 'Keep your account secure'}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {pwMessage && (
                    <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${pwMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {pwMessage.type === 'success' ? <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
                      {pwMessage.text}
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                    <div className="relative">
                      <input type={showCurrentPw ? 'text' : 'password'} value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} className={inputCls} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}>
                        {showCurrentPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                    <div className="relative">
                      <input type={showNewPw ? 'text' : 'password'} value={passwordData.newPassword} onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} className={inputCls} placeholder={isRTL ? '8 أحرف على الأقل' : 'At least 8 characters'} />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}>
                        {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                      <p className="text-xs text-red-500 mt-1">{isRTL ? 'يجب أن تكون 8 أحرف على الأقل' : 'Must be at least 8 characters'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>{isRTL ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
                    <div className="relative">
                      <input type={showConfirmPw ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} className={inputCls} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600`}>
                        {showConfirmPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}</p>
                    )}
                  </div>
                  <button onClick={handleChangePassword} disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {changingPassword && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {changingPassword ? (isRTL ? 'جاري التغيير...' : 'Changing...') : (isRTL ? 'تغيير كلمة المرور' : 'Change Password')}
                  </button>
                </div>
              </div>

              {/* Privacy & Data */}
              <div className={sectionCardCls}>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <FiShield className="w-6 h-6 text-blue-600" />
                    <h3 className="font-telegraf font-bold text-blue-900">{isRTL ? 'الخصوصية وحماية البيانات' : 'Privacy & Data Protection'}</h3>
                  </div>
                  <p className="text-sm text-blue-700">{isRTL ? 'نحترم خصوصيتك ونلتزم بقانون حماية البيانات الشخصية في المملكة العربية السعودية' : 'We respect your privacy and comply with Saudi Arabia\'s Personal Data Protection Law'}</p>
                </div>
                <div className="p-6">
                  <Link href="/legal/privacy-policy">
                    <button className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition-colors">{isRTL ? 'عرض سياسة الخصوصية الكاملة' : 'View Full Privacy Policy'}</button>
                  </Link>
                </div>
              </div>

              {/* Legal Documents */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-telegraf font-bold text-navy-900">{isRTL ? 'المستندات القانونية' : 'Legal Documents'}</h3>
                </div>
                <div className="p-2">
                  {[
                    { href: '/legal/terms-of-use', label: isRTL ? 'شروط الاستخدام' : 'Terms of Use' },
                    { href: '/legal/privacy-policy', label: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy' },
                    { href: '/legal/ai-disclosure', label: isRTL ? 'الإفصاح عن الذكاء الاصطناعي' : 'AI Usage Disclosure' },
                  ].map((doc, i) => (
                    <Link key={i} href={doc.href} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-700">{doc.label}</span>
                      <FiChevronRight className={`w-4 h-4 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Data */}
              <div className={sectionCardCls}>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-telegraf font-bold text-navy-900">{isRTL ? 'بيانات الحساب' : 'Account Data'}</h3>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: isRTL ? 'البريد الإلكتروني' : 'Email', value: user?.email },
                    { label: isRTL ? 'تاريخ الإنشاء' : 'Account Created', value: formatUserDate(user?.createdAt) },
                    { label: isRTL ? 'آخر تحديث' : 'Last Updated', value: formatUserDate(user?.updatedAt) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-semibold text-navy-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Account — Danger Zone */}
              <div className="bg-white rounded-2xl shadow-sm border-2 border-red-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 flex items-center gap-3 bg-red-50/50">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-100"><FiTrash2 className="w-4.5 h-4.5 text-red-600" /></div>
                  <div>
                    <h3 className="font-telegraf font-bold text-red-800">{isRTL ? 'منطقة الخطر' : 'Danger Zone'}</h3>
                    <p className="text-xs text-red-500">{isRTL ? 'إجراءات لا يمكن التراجع عنها' : 'Irreversible actions'}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    {isRTL
                      ? 'حذف حسابك سيؤدي إلى إزالة جميع بياناتك نهائياً بما في ذلك سيرك الذاتية وملفك الشخصي. لا يمكن التراجع عن هذا الإجراء.'
                      : 'Deleting your account will permanently remove all your data including your CVs, profile, and all associated information. This action cannot be undone.'}
                  </p>
                  <button onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">
                    <FiTrash2 className="w-4 h-4" />{isRTL ? 'حذف حسابي نهائياً' : 'Delete My Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                <div className="p-6 bg-red-50 border-b border-red-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100"><FiAlertCircle className="w-5 h-5 text-red-600" /></div>
                    <div>
                      <h3 className="font-telegraf font-bold text-red-800">{isRTL ? 'حذف الحساب' : 'Delete Account'}</h3>
                      <p className="text-xs text-red-600">{isRTL ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    {isRTL
                      ? 'هل أنت متأكد؟ سيتم حذف جميع بياناتك بشكل نهائي، بما في ذلك جميع سيرك الذاتية وملفك الشخصي. لا يمكن استعادة البيانات بعد الحذف.'
                      : 'Are you sure? All your data will be permanently deleted, including all your CVs and profile information. This cannot be recovered.'}
                  </p>
                  {deleteError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4 flex-shrink-0" />{deleteError}
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>{isRTL ? 'أدخل كلمة المرور للتأكيد' : 'Enter your password to confirm'}</label>
                    <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className={inputCls} placeholder="••••••••" autoFocus />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }} className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button onClick={handleDeleteAccount} disabled={deletingAccount || !deletePassword} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {deletingAccount && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {deletingAccount ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : (isRTL ? 'حذف نهائياً' : 'Delete Permanently')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCvSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-telegraf font-bold text-navy-900 text-lg">
                  {isRTL ? 'اختر السيرة الذاتية للمزامنة' : 'Select CV to Sync From'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isRTL ? 'اختر السيرة الذاتية التي تريد مزامنة بياناتها' : 'Choose which CV to pull your profile data from'}
                </p>
              </div>
              <button
                onClick={() => setShowCvSelectModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {allCvsList.map((cv: any) => (
                <button
                  key={cv.id}
                  onClick={() => {
                    setShowCvSelectModal(false);
                    doSync(cv);
                  }}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-accent-400 hover:bg-accent-50/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 text-sm truncate group-hover:text-accent-700">
                        {cv.title || (isRTL ? 'سيرة ذاتية' : 'My CV')}
                      </p>
                      {cv.templateId && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {isRTL ? 'القالب:' : 'Template:'} {cv.templateId}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                      </p>
                      <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent-500 mt-1 ml-auto" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowCvSelectModal(false)}
                className="w-full py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes settingsBlobDrift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -15px) scale(1.05); } }
        @keyframes settingsBlobDrift2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-15px, 10px) scale(1.04); } }
        .settings-blob-1 { animation: settingsBlobDrift1 12s ease-in-out infinite; }
        .settings-blob-2 { animation: settingsBlobDrift2 15s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}