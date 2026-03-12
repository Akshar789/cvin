'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SocialLogin from '@/components/auth/SocialLogin';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, refreshUser } = useAuth();
  const { t, isRTL } = useLanguage();

  const prefillEmail = searchParams.get('email') || '';
  const fromCvBuilder = searchParams.get('from') === 'cv-builder';
  const templateParam = searchParams.get('template') || '';

  const [formData, setFormData] = useState({
    email: prefillEmail,
    username: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefillEmail) {
      setFormData(prev => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const syncGuestCvBeforeRegister = async (email: string) => {
    try {
      const generatedCV = sessionStorage.getItem('generatedCV');
      if (!generatedCV) return;
      const parsedCV = JSON.parse(generatedCV);
      const contentAr = sessionStorage.getItem('cvContentAr');
      let parsedAr = null;
      if (contentAr) {
        try { parsedAr = JSON.parse(contentAr); } catch (_) {}
      }
      const templateId = sessionStorage.getItem('selectedTemplate') || parsedCV?.personalInfo?.templateSlug || '';
      const cvContentLang = sessionStorage.getItem('cvContentLanguage') || 'en';

      const cvData = {
        generatedContent: {
          personalInfo: parsedCV.personalInfo || {},
          professionalSummary: parsedCV.professionalSummary || parsedCV.summary || '',
          summary: parsedCV.professionalSummary || parsedCV.summary || '',
          experience: parsedCV.experience || [],
          education: parsedCV.education || [],
          skills: parsedCV.skills || {},
          certifications: parsedCV.certifications || [],
          languages: parsedCV.languages || [],
        },
        templateId,
        language: cvContentLang,
        ...(parsedAr ? {
          englishContent: {
            personalInfo: parsedCV.personalInfo || {},
            professionalSummary: parsedCV.professionalSummary || '',
            experience: parsedCV.experience || [],
            education: parsedCV.education || [],
            skills: parsedCV.skills || {},
            certifications: parsedCV.certifications || [],
            languages: parsedCV.languages || [],
          },
          arabicContent: {
            personalInfo: parsedAr.personalInfo || {},
            professionalSummary: parsedAr.professionalSummary || '',
            experience: parsedAr.experience || [],
            education: parsedAr.education || [],
            skills: parsedAr.skills || {},
            certifications: parsedAr.certifications || [],
            languages: parsedAr.languages || [],
          },
        } : {}),
      };

      console.log('[Register] Syncing full CV data to guest_cvs before registration');
      await fetch('/api/guest-cv/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cvData, templateId }),
      });
    } catch (err) {
      console.error('[Register] Failed to sync guest CV before registration:', err);
    }
  };

  const saveSessionCvToMigratedCv = async (token: string, migratedCvId: number | null) => {
    try {
      const generatedCV = sessionStorage.getItem('generatedCV');
      if (!generatedCV) return;
      const parsedCV = JSON.parse(generatedCV);
      const contentAr = sessionStorage.getItem('cvContentAr');
      let parsedAr = null;
      if (contentAr) {
        try { parsedAr = JSON.parse(contentAr); } catch (_) {}
      }

      let cvId = migratedCvId;
      if (!cvId) {
        console.warn('[Register] No migrated CV ID, falling back to latest CV lookup');
        const listRes = await fetch('/api/cvs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          const userCvs = listData.cvs || listData;
          if (Array.isArray(userCvs) && userCvs.length > 0) {
            const latestCv = userCvs.sort((a: any, b: any) =>
              new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()
            )[0];
            cvId = latestCv.id;
          }
        }
        if (!cvId) {
          console.warn('[Register] No CV found to save to');
          return;
        }
      }

      const savedTemplate = sessionStorage.getItem('selectedTemplate') || parsedCV?.personalInfo?.templateSlug || 'simple-professional';
      const fullName = parsedCV.personalInfo?.fullName || parsedCV.personalInfo?.name || 'My CV';
      const payload: any = {
        title: `${fullName}'s CV`,
        templateId: savedTemplate,
        personalInfo: parsedCV.personalInfo || {},
        summary: parsedCV.professionalSummary || '',
        professionalSummary: parsedCV.professionalSummary || '',
        experience: parsedCV.experience || [],
        education: parsedCV.education || [],
        skills: parsedCV.skills || { technical: [], soft: [], tools: [] },
        certifications: parsedCV.certifications || [],
        languages: parsedCV.languages || [],
        language: 'en',
        textDirection: 'ltr',
      };

      if (parsedAr) {
        payload.contentAr = {
          personalInfo: parsedAr.personalInfo || {},
          professionalSummary: parsedAr.professionalSummary || '',
          experience: parsedAr.experience || [],
          education: parsedAr.education || [],
          skills: parsedAr.skills || { technical: [], soft: [], tools: [] },
          certifications: parsedAr.certifications || [],
          languages: parsedAr.languages || [],
        };
      }

      console.log('[Register] Saving full CV data to migrated CV', cvId);
      await fetch(`/api/cv/${cvId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      sessionStorage.setItem('editingCvId', String(cvId));
      console.log('[Register] Migrated CV updated with full content, set editingCvId =', cvId);
    } catch (err) {
      console.error('[Register] Failed to save session CV to migrated CV:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (fromCvBuilder) {
        await syncGuestCvBeforeRegister(formData.email);
      }

      const { migratedCvId } = await register(formData);
      const storedToken = localStorage.getItem('token');
      if (fromCvBuilder && storedToken) {
        await fetch('/api/auth/complete-onboarding', {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        await saveSessionCvToMigratedCv(storedToken, migratedCvId || null);

        await refreshUser();
        const returnTemplate = templateParam || sessionStorage.getItem('selectedTemplate') || '';
        router.replace(`/cv/preview${returnTemplate ? `?template=${returnTemplate}` : ''}`);
        return;
      }
      router.push('/dashboard');
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      if (apiError) {
        setError(apiError);
      } else {
        setError(t.auth.registrationFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-navy-50 to-turquoise-50 py-12 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            {t.auth.greeting} 👋
          </h1>
          <p className="text-gray-600 text-lg">
            {t.auth.createAccount}
          </p>
        </div>

        <Card className="w-full">
          <h2 className="text-2xl font-bold text-navy-900 mb-6 text-center">
            {isRTL ? 'إنشاء حساب' : 'Create Your Account'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="fullName"
              label={t.auth.fullName}
              value={formData.fullName}
              onChange={handleChange}
              placeholder={isRTL ? 'أحمد محمد' : 'John Doe'}
              required
            />
            <Input
              type="text"
              name="username"
              label={t.auth.username}
              value={formData.username}
              onChange={handleChange}
              required
              placeholder={isRTL ? 'ahmadm' : 'johndoe'}
            />
            <Input
              type="email"
              name="email"
              label={t.auth.email}
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={isRTL ? 'ahmad@example.com' : 'your@email.com'}
            />
            <Input
              type="password"
              name="password"
              label={t.auth.password}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              helperText={t.auth.passwordHelper}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              {loading ? t.auth.creatingAccount : t.auth.completeRegistration}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t.auth.orContinueWith}</span>
              </div>
            </div>
            <div className="mt-6">
              <SocialLogin callbackUrl={fromCvBuilder && templateParam ? `/cv/preview?template=${templateParam}` : '/dashboard'} />
            </div>
          </div>

          <p className="mt-6 text-center text-gray-600">
            {t.auth.alreadyHaveAccount}{' '}
            <Link href={`/auth/login${fromCvBuilder ? `?email=${encodeURIComponent(formData.email)}&from=cv-builder${templateParam ? `&template=${templateParam}` : ''}` : ''}`} className="text-turquoise-600 font-semibold hover:underline">
              {t.auth.login}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
