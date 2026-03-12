'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import CvBuilderLayout from '@/components/cv-builder/CvBuilderLayout';
import ContentFormSection from '@/components/cv-builder/ContentFormSection';
import TemplatePreview from '@/components/cv-builder/TemplatePreview';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FiDownload, FiSave, FiDroplet, FiImage, FiArrowRight, FiLoader, FiUser, FiFileText, FiBriefcase, FiBook, FiAward, FiGlobe, FiTarget, FiCheckCircle, FiEye, FiLayout, FiAlertTriangle, FiCamera, FiToggleLeft, FiToggleRight, FiLock } from 'react-icons/fi';
import Link from 'next/link';
import axios from 'axios';
import { prepareCvForPersistence } from '@/lib/cv/schema';

export default function CVBuilderPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { isRTL } = useLanguage();
  const [step, setStep] = useState(1);
  const [cvData, setCvData] = useState({
    personalInfo: {
      name: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: user?.location || '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    courses: [],
    languages: [],
  });
  const [template, setTemplate] = useState<'ats' | 'attractive'>('ats');
  const [templateSettings, setTemplateSettings] = useState({
    primaryColor: '#1a73e8',
    accentColor: '#4285f4',
    headerBg: '#f8f9fa',
    photoUrl: '',
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cvId, setCvId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cvLanguage, setCvLanguage] = useState<string>('en');
  const [includePhotoInCV, setIncludePhotoInCV] = useState(false);
  const [showMissingPhotoNotice, setShowMissingPhotoNotice] = useState(false);

  const isPremium = user?.subscriptionTier !== 'free';
  const userProfilePhoto = (user as any)?.profilePicture || null;
  const templateSupportsPhoto = template === 'attractive';
  const isCvRTL = cvLanguage === 'ar';

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, loggingOut]);

  // Load editing CV data from sessionStorage (when redirected from edit page)
  useEffect(() => {
    const editingCvJson = sessionStorage.getItem('editingCv');
    if (editingCvJson) {
      try {
        const editingCv = JSON.parse(editingCvJson);
        
        setCvId(editingCv.id || null);
        setCvData({
          personalInfo: editingCv.personalInfo || {
            name: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phoneNumber || '',
            location: user?.location || '',
          },
          summary: editingCv.summary || '',
          experience: editingCv.experience || [],
          education: editingCv.education || [],
          skills: editingCv.skills || [],
          courses: editingCv.courses || [],
          languages: editingCv.languages || [],
        });
        
        sessionStorage.removeItem('editingCv');
      } catch (error) {
        console.error('Failed to load editing CV from sessionStorage:', error);
        sessionStorage.removeItem('editingCv');
      }
    }
  }, []);

  // Pre-fill CV data from user profile (only if not editing existing CV)
  useEffect(() => {
    if (user && cvData.personalInfo.name === '' && !cvId) {
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          name: user.fullName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          location: user.location || '',
        }
      }));
    }
  }, [user, cvId]);

  // Load CV language from sessionStorage
  useEffect(() => {
    const storedLanguage = sessionStorage.getItem('cvLanguage');
    if (storedLanguage) {
      setCvLanguage(storedLanguage);
    }
  }, []);

  const handleTemplateChange = (newTemplate: 'ats' | 'attractive') => {
    if (newTemplate === 'attractive' && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setTemplate(newTemplate);
    setStep(2);
  };

  const handlePhotoToggle = () => {
    if (!includePhotoInCV) {
      if (!userProfilePhoto) {
        setShowMissingPhotoNotice(true);
        return;
      }
      setIncludePhotoInCV(true);
      setTemplateSettings(prev => ({
        ...prev,
        photoUrl: userProfilePhoto,
      }));
    } else {
      setIncludePhotoInCV(false);
      setTemplateSettings(prev => ({
        ...prev,
        photoUrl: '',
      }));
    }
  };

  const handleSaveCV = async () => {
    if (!token) {
      setSaveError('Please log in to save your CV');
      return null;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // Normalize data before persistence - transform strings to objects with IDs
      const normalizedCvData = {
        ...cvData,
        skills: Array.isArray(cvData.skills) ? cvData.skills.map((skill: any, idx: number) => ({
          id: `skill-${idx}`,
          category: 'General',
          skillsList: typeof skill === 'string' ? skill.split(',').map((s: string) => s.trim()) : (skill.skillsList || [])
        })) : [],
        courses: Array.isArray(cvData.courses) ? cvData.courses.map((course: any, idx: number) => 
          typeof course === 'string' ? { id: `course-${idx}`, name: course.trim() } : course
        ) : (typeof cvData.courses === 'string' ? 
          (cvData.courses as string).split('\n').filter((c: string) => c.trim()).map((c: string, idx: number) => ({
            id: `course-${idx}`,
            name: c.trim()
          })) : []),
        languages: Array.isArray(cvData.languages) ? cvData.languages.map((lang: any, idx: number) => 
          typeof lang === 'string' ? { id: `lang-${idx}`, name: lang, level: 'Fluent' } : lang
        ) : []
      };

      const normalizedData = prepareCvForPersistence(normalizedCvData);

      if (cvId) {
        await axios.put(
          `/api/cv/${cvId}`,
          normalizedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return cvId;
      } else {
        const response = await axios.post(
          '/api/cvs',
          {
            title: `CV - ${cvData.personalInfo.name || 'Untitled'}`,
            personalInfo: normalizedData.personalInfo,
            summary: normalizedData.summary,
            templateId: null,
            language: 'en',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.data || !response.data.cv || !response.data.cv.id) {
          setSaveError('Invalid response from server. Please try again.');
          return null;
        }

        const newCvId = response.data.cv.id;
        setCvId(newCvId);
        
        await axios.put(
          `/api/cv/${newCvId}`,
          normalizedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        return newCvId;
      }
    } catch (error: any) {
      console.error('Save CV error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save CV. Please try again.';
      setSaveError(errorMessage);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!token) {
      setSaveError('Please log in to download your CV');
      alert('Please log in to download your CV');
      return;
    }

    setDownloading(true);
    setSaveError(null);

    try {
      const savedCvId = await handleSaveCV();
      
      if (!savedCvId) {
        setSaveError('Failed to save CV before download. Please try again.');
        alert('Failed to save CV. Please try again.');
        return;
      }

      if (format === 'pdf') {
        try {
          // Build URL with template and photo options
          const params = new URLSearchParams({
            template: template === 'attractive' ? 'modern' : 'classic-ats',
            includePhoto: (template === 'attractive' && includePhotoInCV).toString(),
          });
          
          const response = await fetch(`/api/cv/${savedCvId}/export-pdf?${params.toString()}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            let errorMessage = 'Failed to generate PDF';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch {
              const errorText = await response.text();
              console.error('PDF export error response:', errorText);
            }
            throw new Error(errorMessage);
          }

          const blob = await response.blob();
          console.log('PDF blob size:', blob.size, 'type:', blob.type);
          
          if (blob.size === 0) {
            throw new Error('Generated PDF is empty. Please try again.');
          }
          
          // Verify it's actually a PDF
          if (!blob.type.includes('pdf') && blob.size > 0) {
            console.warn('Response is not PDF type, but has content. Proceeding with download.');
          }

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${cvData.personalInfo.name || 'CV'}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          alert('CV downloaded successfully!');
        } catch (exportError: any) {
          console.error('PDF export error:', exportError);
          const errorMessage = exportError.response?.data?.error || 'Failed to generate PDF. Please try again.';
          setSaveError(errorMessage);
          alert(errorMessage);
        }
      } else {
        alert('Word export coming soon!');
      }
    } catch (error: any) {
      console.error('Download failed:', error);
      const errorMessage = 'Failed to download CV. Please try again.';
      setSaveError(errorMessage);
      alert(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <CvBuilderLayout currentStep={step} onStepChange={setStep}>
      {/* STEP 1: CONTENT BUILDER */}
      {step === 1 && (
        <div className="grid grid-cols-3 gap-8">
          {/* Preview */}
          <div className="col-span-1">
            <Card className="sticky top-24 bg-white shadow-xl border border-gray-100">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <FiEye className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-800">Live Preview</h3>
                </div>
                <div id="cv-preview" className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-100 p-2 bg-gray-50">
                  <TemplatePreview template={template} settings={templateSettings} data={cvData} isRTL={isCvRTL} />
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="col-span-2 space-y-6">
            {/* Personal Info */}
            <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                    <p className="text-sm text-gray-600">Tell us about yourself</p>
                  </div>
                </div>
                <ContentFormSection
                  section="personal"
                  data={cvData.personalInfo}
                  onUpdate={(data) =>
                    setCvData(prev => ({ ...prev, personalInfo: data }))
                  }
                  isPremium={isPremium}
                />
              </div>
            </Card>

            {/* Professional Summary */}
            <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-indigo-100">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FiFileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Professional Summary</h3>
                    <p className="text-sm text-gray-600">Summarize your key qualifications and career highlights</p>
                  </div>
                </div>
                <ContentFormSection
                  section="summary"
                  data={cvData.summary}
                  onUpdate={(data) =>
                    setCvData(prev => ({
                      ...prev,
                      summary: data
                    }))
                  }
                  isPremium={isPremium}
                />
              </div>
            </Card>

            {/* Experience */}
            <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-100">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiBriefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Work Experience</h3>
                    <p className="text-sm text-gray-600">Add your professional work history</p>
                  </div>
                </div>
                <ContentFormSection
                  section="experience"
                  data={cvData.experience}
                  onUpdate={(data) =>
                    setCvData(prev => ({ ...prev, experience: data }))
                  }
                  isPremium={isPremium}
                />
              </div>
            </Card>

            {/* Education */}
            <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-100">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiBook className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Education</h3>
                    <p className="text-sm text-gray-600">Add your academic background</p>
                  </div>
                </div>
                <ContentFormSection
                  section="education"
                  data={cvData.education}
                  onUpdate={(data) =>
                    setCvData(prev => ({ ...prev, education: data }))
                  }
                  isPremium={isPremium}
                />
              </div>
            </Card>

            {/* Skills */}
            <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-teal-100">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FiTarget className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Skills & Competencies</h3>
                    <p className="text-sm text-gray-600">List your key professional skills</p>
                  </div>
                </div>
                <ContentFormSection
                  section="skills"
                  data={cvData.skills}
                  onUpdate={(data) =>
                    setCvData(prev => ({ ...prev, skills: data }))
                  }
                  isPremium={isPremium}
                />
              </div>
            </Card>

            {/* Courses & Certifications */}
            <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-amber-100">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FiAward className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Certifications & Courses</h3>
                    <p className="text-sm text-gray-600">Add professional training and certifications</p>
                  </div>
                </div>
                <ContentFormSection
                  section="courses"
                  data={cvData.courses}
                  onUpdate={(data) =>
                    setCvData(prev => ({ ...prev, courses: data }))
                  }
                  isPremium={isPremium}
                />
              </div>
            </Card>

            {/* Languages */}
            <Card className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pink-100">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <FiGlobe className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Languages</h3>
                    <p className="text-sm text-gray-600">Add languages you speak and your proficiency level</p>
                  </div>
                </div>
                <ContentFormSection
                  section="languages"
                  data={cvData.languages}
                  onUpdate={(data) =>
                    setCvData(prev => ({ ...prev, languages: data }))
                  }
                  isPremium={isPremium}
                />
              </div>
            </Card>

            {/* Next Button */}
            <div className="pt-6">
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-4 text-lg font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Continue to Design & Templates <FiArrowRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: TEMPLATE & DESIGN */}
      {step === 2 && (
        <div className="grid grid-cols-2 gap-8">
          {/* Preview */}
          <div className="col-span-1">
            <Card className="sticky top-24 bg-white shadow-xl border border-gray-100">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <FiEye className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-800">Live Preview</h3>
                </div>
                <div id="cv-preview" className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-100 p-2 bg-gray-50">
                  <TemplatePreview template={template} settings={templateSettings} data={cvData} isRTL={isCvRTL} />
                </div>
              </div>
            </Card>
          </div>

          {/* Settings */}
          <div className="col-span-1 space-y-6">
            {/* Template Selection */}
            <Card className="bg-white shadow-lg border border-gray-100">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiLayout className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Choose Template</h3>
                    <p className="text-sm text-gray-600">Select a professional CV template</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => setTemplate('ats')}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
                      template === 'ats' 
                        ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-gray-800">Classic ATS</div>
                      {template === 'ats' && <FiCheckCircle className="w-6 h-6 text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-600">Clean, professional format optimized for Applicant Tracking Systems</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">One Column</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">ATS-Friendly</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">B&W</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTemplateChange('attractive')}
                    className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left relative hover:shadow-lg ${
                      template === 'attractive' 
                        ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md' 
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    } ${!isPremium ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg text-gray-800">Attractive Design</div>
                      {template === 'attractive' && isPremium && <FiCheckCircle className="w-6 h-6 text-purple-600" />}
                      {!isPremium && <span className="text-xs bg-amber-500 text-white px-3 py-1 rounded-full font-semibold">Premium</span>}
                    </div>
                    <p className="text-sm text-gray-600">Modern, colorful design with visual hierarchy and photo support</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Two Column</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Photo Support</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Colorful</span>
                    </div>
                  </button>
                </div>
              </div>
            </Card>

            {/* Color Settings (Pro Only) */}
            {template === 'attractive' && isPremium && (
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiDroplet className="w-5 h-5" /> Customize Design
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={templateSettings.primaryColor}
                          onChange={(e) =>
                            setTemplateSettings(prev => ({
                              ...prev,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={templateSettings.primaryColor}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                          readOnly
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={templateSettings.accentColor}
                          onChange={(e) =>
                            setTemplateSettings(prev => ({
                              ...prev,
                              accentColor: e.target.value,
                            }))
                          }
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={templateSettings.accentColor}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Include Profile Photo Toggle */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiCamera className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-semibold">{isRTL ? 'إضافة الصورة الشخصية' : 'Include Profile Photo in CV'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handlePhotoToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            includePhotoInCV ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              includePhotoInCV ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {includePhotoInCV && userProfilePhoto && (
                        <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <img
                            src={userProfilePhoto}
                            alt="Profile"
                            className="w-12 h-12 rounded-lg object-cover border-2 border-green-300"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-green-800 font-medium">
                              {isRTL ? 'سيتم تضمين صورتك الشخصية' : 'Your profile photo will be included'}
                            </p>
                            <p className="text-xs text-green-600">
                              {isRTL ? 'يمكنك تغييرها من صفحة الملف الشخصي' : 'You can change it from your Profile page'}
                            </p>
                          </div>
                        </div>
                      )}

                      {showMissingPhotoNotice && (
                        <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-amber-800 font-medium">
                                {isRTL ? 'لم يتم العثور على صورة شخصية' : 'No profile photo found'}
                              </p>
                              <p className="text-xs text-amber-700 mt-1">
                                {isRTL 
                                  ? 'يرجى تحميل صورة احترافية في صفحة الملف الشخصي.'
                                  : 'Please upload a professional photo in your Profile page.'}
                              </p>
                              <Link
                                href="/settings"
                                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                              >
                                <FiCamera className="w-4 h-4" />
                                {isRTL ? 'الذهاب إلى إعدادات الصورة' : 'Go to Profile Photo Settings'}
                              </Link>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowMissingPhotoNotice(false)}
                            className="absolute top-2 right-2 text-amber-600 hover:text-amber-800"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                Continue to Download <FiArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DOWNLOAD & EXPORT */}
      {step === 3 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Preview */}
          <div className="col-span-1">
            <Card className="sticky top-24 bg-white max-h-screen overflow-y-auto">
              <div id="cv-preview" className="p-8">
                <TemplatePreview template={template} settings={templateSettings} data={cvData} isRTL={isCvRTL} />
              </div>
            </Card>
          </div>

          {/* Download Options */}
          <div className="col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-6">Download Your CV</h3>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleDownload('pdf')}
                    loading={downloading}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 flex items-center justify-center gap-2"
                  >
                    {downloading ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiDownload className="w-5 h-5" />
                    )}
                    Download as PDF
                  </Button>

                  {isPremium && (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 py-3 flex items-center justify-center gap-2">
                      <FiDownload className="w-5 h-5" />
                      Download as Word (.docx)
                    </Button>
                  )}

                  {!isPremium && (
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      variant="outline"
                      className="w-full py-3"
                    >
                      Unlock Word Export (Pro)
                    </Button>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    ✓ ATS Optimized<br/>
                    ✓ Ready for job applications<br/>
                    {isPremium && '✓ Unlimited downloads'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Save Actions */}
            <Card className="bg-white">
              <div className="p-6 space-y-3">
                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {saveError}
                  </div>
                )}
                
                {cvId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    ✓ CV saved successfully
                  </div>
                )}
                
                <Button 
                  onClick={handleSaveCV}
                  loading={saving}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  Save to Dashboard
                </Button>
                <Button variant="outline" className="w-full py-2">
                  Share CV Link (Coming Soon)
                </Button>
              </div>
            </Card>

            {/* Navigation */}
            <Button
              onClick={() => setStep(2)}
              variant="outline"
              className="w-full"
            >
              Back to Design
            </Button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Upgrade to Pro</h3>
              <p className="text-gray-600">
                Premium templates and features are available for Pro members.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">✓ Both CV templates</li>
                <li className="flex items-center gap-2">✓ Custom colors & themes</li>
                <li className="flex items-center gap-2">✓ Profile photo upload</li>
                <li className="flex items-center gap-2">✓ Download as PDF & Word</li>
                <li className="flex items-center gap-2">✓ Unlimited AI features</li>
              </ul>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => router.push('/subscribe')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </CvBuilderLayout>
  );
}
