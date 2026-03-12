'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function CVEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { isRTL } = useLanguage();
  const { id } = use(params);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
      return;
    }

    if (user && token && id) {
      loadAndRedirect();
    }
  }, [user, authLoading, token, id]);

  const loadAndRedirect = async () => {
    try {
      setError(null);
      
      const response = await axios.get(`/api/cv/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cvData = response.data.cv;

      if (!cvData) {
        throw new Error('CV not found');
      }

      // Normalize skills to the format expected by /cv/edit: { technical: [], soft: [], tools: [] }
      let normalizedSkills: { technical: string[], soft: string[], tools: string[] } = {
        technical: [],
        soft: [],
        tools: []
      };
      
      if (cvData.skills) {
        if (typeof cvData.skills === 'object' && !Array.isArray(cvData.skills)) {
          // Already in correct format or similar object format
          normalizedSkills.technical = Array.isArray(cvData.skills.technical) ? cvData.skills.technical : [];
          normalizedSkills.soft = Array.isArray(cvData.skills.soft) ? cvData.skills.soft : [];
          normalizedSkills.tools = Array.isArray(cvData.skills.tools) ? cvData.skills.tools : [];
        } else if (Array.isArray(cvData.skills)) {
          // Skills stored as array - put them in technical by default
          normalizedSkills.technical = cvData.skills.filter((s: any) => typeof s === 'string');
        }
      }

      // Normalize experience with responsibilities (format: { company, position, startDate, endDate, location, responsibilities[] })
      const normalizedExperience = Array.isArray(cvData.experience) 
        ? cvData.experience.map((exp: any) => ({
            company: exp.company || '',
            position: exp.position || exp.title || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            responsibilities: Array.isArray(exp.responsibilities) 
              ? exp.responsibilities 
              : (exp.description ? [exp.description] : [''])
          }))
        : [];

      // Normalize education (format: { institution, degree, startDate, endDate, location, gpa, achievements[] })
      const normalizedEducation = Array.isArray(cvData.education)
        ? cvData.education.map((edu: any) => ({
            institution: edu.institution || edu.school || '',
            degree: edu.degree || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || edu.graduationDate || '',
            location: edu.location || '',
            gpa: edu.gpa || '',
            achievements: Array.isArray(edu.achievements) ? edu.achievements : []
          }))
        : [];

      // Normalize certifications/courses (format: { name, issuer, date, credentialId? })
      const normalizedCertifications = Array.isArray(cvData.certifications || cvData.courses)
        ? (cvData.certifications || cvData.courses).map((cert: any) => {
            if (typeof cert === 'string') {
              return { name: cert, issuer: '', date: '', credentialId: '' };
            }
            return {
              name: cert.name || cert.title || '',
              issuer: cert.issuer || cert.organization || '',
              date: cert.date || cert.issueDate || '',
              credentialId: cert.credentialId || ''
            };
          })
        : [];

      // Normalize languages (format: { name, proficiency })
      const normalizedLanguages = Array.isArray(cvData.languages)
        ? cvData.languages.map((lang: any) => {
            if (typeof lang === 'string') {
              return { name: lang, proficiency: 'Fluent' };
            }
            return {
              name: lang.name || lang.language || '',
              proficiency: lang.proficiency || lang.level || 'Fluent'
            };
          })
        : [];

      // Build the CV data object in the format expected by /cv/edit
      const generatedCVData = {
        id: cvData.id,
        personalInfo: {
          fullName: cvData.personalInfo?.name || cvData.personalInfo?.fullName || '',
          email: cvData.personalInfo?.email || '',
          phone: cvData.personalInfo?.phone || cvData.personalInfo?.phoneNumber || '',
          location: cvData.personalInfo?.location || '',
          nationality: cvData.personalInfo?.nationality || '',
          linkedin: cvData.personalInfo?.linkedin || '',
          targetJobDomain: cvData.personalInfo?.targetJobDomain || ''
        },
        professionalSummary: cvData.summary || cvData.professionalSummary || '',
        experience: normalizedExperience,
        education: normalizedEducation,
        skills: normalizedSkills,
        certifications: normalizedCertifications,
        languages: normalizedLanguages,
        cvLanguage: cvData.language || 'en'
      };

      sessionStorage.setItem('generatedCV', JSON.stringify(generatedCVData));
      sessionStorage.setItem('editingCvId', id.toString());
      
      if (cvData.contentAr) {
        sessionStorage.setItem('cvContentAr', JSON.stringify(cvData.contentAr));
      } else {
        sessionStorage.removeItem('cvContentAr');
      }
      
      if (cvData.language) {
        sessionStorage.setItem('cvLanguage', cvData.language);
      }
      
      const resolvedTemplate = cvData.templateId || cvData.personalInfo?.templateSlug || 'simple-professional';
      const templateSlug = typeof resolvedTemplate === 'string' ? resolvedTemplate : 'simple-professional';
      sessionStorage.setItem('selectedTemplate', templateSlug);

      const colorSettings = cvData.colorSettings || cvData.personalInfo?.colorSettings || null;
      if (colorSettings?.primaryColor) {
        sessionStorage.setItem('selectedColor', colorSettings.primaryColor);
      }

      router.push(`/cv/edit?template=${encodeURIComponent(templateSlug)}`);
    } catch (error: any) {
      console.error('Failed to fetch CV:', error);
      
      let errorMessage = isRTL ? 'فشل في تحميل السيرة الذاتية' : 'Failed to load CV';
      
      if (error.response) {
        // Server responded with error
        const serverError = error.response.data?.error || error.response.statusText;
        if (serverError) {
          errorMessage = serverError;
        } else if (error.response.status === 404) {
          errorMessage = isRTL ? 'السيرة الذاتية غير موجودة' : 'CV not found';
        } else if (error.response.status === 401) {
          errorMessage = isRTL ? 'يرجى تسجيل الدخول مرة أخرى' : 'Please log in again';
        } else if (error.response.status === 500) {
          errorMessage = isRTL ? 'خطأ في الخادم. يرجى المحاولة مرة أخرى' : 'Server error. Please try again';
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = isRTL ? 'لا يمكن الاتصال بالخادم' : 'Cannot connect to server';
      } else {
        // Error setting up request
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isRTL ? 'خطأ في تحميل السيرة الذاتية' : 'Error Loading CV'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isRTL ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {isRTL ? 'جاري تحميل سيرتك الذاتية...' : 'Loading your CV...'}
        </h2>
        <p className="text-gray-500">
          {isRTL ? 'يرجى الانتظار بينما نجهز سيرتك الذاتية للتحرير' : 'Please wait while we prepare your CV for editing'}
        </p>
      </div>
    </div>
  );
}
