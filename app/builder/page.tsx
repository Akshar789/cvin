'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { FiSave, FiDownload, FiPlus, FiTrash2, FiUpload, FiZap, FiImage, FiFile, FiCheckCircle, FiStar } from 'react-icons/fi';

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { t, isRTL } = useLanguage();
  const cvId = searchParams?.get('cvId');
  const templateParam = searchParams?.get('template');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [aiSuggestLoading, setAiSuggestLoading] = useState<{[key: string]: boolean}>({});
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [cvData, setCvData] = useState({
    title: '',
    templateId: templateParam ? parseInt(templateParam) : 5,
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      photo: '',
    },
    summary: '',
    experience: [] as any[],
    education: [] as any[],
    skills: [] as any[],
  });

  useEffect(() => {
    if (cvId && token) {
      loadCV(parseInt(cvId));
    }
  }, [cvId, token]);

  const loadCV = async (id: number) => {
    try {
      const response = await axios.get(`/api/cvs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cv = response.data.cv;
      setCvData({
        title: cv.title,
        templateId: cv.templateId || 5,
        personalInfo: cv.personalInfo || { name: '', email: '', phone: '', location: '', photo: '' },
        summary: cv.summary || '',
        experience: cv.experience || [],
        education: cv.education || [],
        skills: cv.skills || [],
      });
      if (cv.personalInfo?.photo) {
        setUploadedPhoto(cv.personalInfo.photo);
      }
    } catch (error) {
      console.error('Failed to load CV:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      let fileType = 'image';
      if (file.type.includes('pdf')) {
        fileType = 'pdf';
      } else if (file.type.includes('wordprocessingml') || file.name.endsWith('.docx')) {
        fileType = 'docx';
      }
      formData.append('fileType', fileType);

      const response = await axios.post('/api/ai/extract-cv-data', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const extracted = response.data.extractedData;
      if (extracted) {
        setCvData({
          ...cvData,
          personalInfo: { ...cvData.personalInfo, ...extracted.personalInfo },
          summary: extracted.summary || cvData.summary,
          experience: extracted.experience?.length > 0 ? extracted.experience : cvData.experience,
          education: extracted.education?.length > 0 ? extracted.education : cvData.education,
          skills: extracted.skills?.length > 0 ? extracted.skills : cvData.skills,
        });
        alert('✅ ' + t.builder.extractSuccess);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || t.builder.extractError);
    } finally {
      setExtracting(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedPhoto(base64);
      setCvData({
        ...cvData,
        personalInfo: { ...cvData.personalInfo, photo: base64 },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAISuggest = async (fieldType: string, index?: number) => {
    const loadingKey = fieldType + (index !== undefined ? `-${index}` : '');
    setAiSuggestLoading({ ...aiSuggestLoading, [loadingKey]: true });
    
    try {
      let context = {};
      let currentValue = '';

      if (fieldType === 'summary') {
        context = {
          experience: cvData.experience,
          education: cvData.education,
          skills: cvData.skills,
        };
        currentValue = cvData.summary;
      } else if (fieldType === 'experience_description' && index !== undefined) {
        context = {
          position: cvData.experience[index].position,
          company: cvData.experience[index].company,
        };
        currentValue = cvData.experience[index].description;
      }

      const response = await axios.post(
        '/api/ai/suggest-field',
        { fieldType, currentValue, context },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const suggestion = response.data.suggestion;

      if (fieldType === 'summary') {
        setCvData({ ...cvData, summary: suggestion });
      } else if (fieldType === 'experience_description' && index !== undefined) {
        const newExp = [...cvData.experience];
        newExp[index].description = suggestion;
        setCvData({ ...cvData, experience: newExp });
      }

      alert('✨ ' + t.builder.aiSuggestionApplied);
    } catch (error: any) {
      alert(error.response?.data?.error || t.builder.aiSuggestionError);
    } finally {
      setAiSuggestLoading({ ...aiSuggestLoading, [loadingKey]: false });
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert(t.builder.pleaseLogin);
      router.push('/auth/login');
      return;
    }

    setSaving(true);
    try {
      if (cvId) {
        await axios.put(
          `/api/cvs/${cvId}`,
          cvData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(t.builder.successSaved);
      } else {
        const response = await axios.post('/api/cvs', cvData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push(`/builder?cvId=${response.data.cv.id}`);
        alert(t.builder.successSaved);
      }
    } catch (error: any) {
      alert(t.builder.errorSaving + ': ' + (error.response?.data?.error || t.builder.unknownError));
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [
        ...cvData.experience,
        { company: '', position: '', location: '', startDate: '', endDate: '', description: '' },
      ],
    });
  };

  const removeExperience = (index: number) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [
        ...cvData.education,
        { institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' },
      ],
    });
  };

  const removeEducation = (index: number) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    setCvData({
      ...cvData,
      skills: [...cvData.skills, { category: '', skillsList: [] }],
    });
  };

  const removeSkill = (index: number) => {
    setCvData({
      ...cvData,
      skills: cvData.skills.filter((_, i) => i !== index),
    });
  };

  const handleDownload = async () => {
    if (!cvId || !token) return;

    try {
      const response = await axios.get(`/api/cvs/${cvId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cvData.title || 'CV'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CV:', error);
      alert(isRTL ? 'فشل في تحميل السيرة الذاتية' : 'Failed to download CV');
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-turquoise-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-navy-900 via-turquoise-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-start">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{t.builder.title}</h1>
              <p className="text-turquoise-100 text-lg">{t.builder.subtitle}</p>
            </div>
            <div className="flex gap-3">
              {cvId && (
                <Button variant="secondary" size="lg" onClick={handleDownload}>
                  <FiDownload className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t.builder.exportPDF}
                </Button>
              )}
              <Button onClick={handleSave} loading={saving} size="lg">
                <FiSave className={isRTL ? 'ml-2' : 'mr-2'} />
                {t.builder.save}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* AI Quick Start - Eye-catching Feature */}
        <Card className="bg-gradient-to-br from-turquoise-500 to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-shadow">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <FiZap size={40} className="text-yellow-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FiStar className="text-yellow-300" />
                <h2 className="text-2xl md:text-3xl font-bold">{t.builder.aiQuickStart}</h2>
              </div>
              <p className="text-turquoise-50 mb-6 text-lg">
                {t.builder.aiQuickStartDesc}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  loading={extracting}
                  className="bg-white text-turquoise-700 hover:bg-turquoise-50 font-semibold shadow-lg"
                >
                  <FiFile className={isRTL ? 'ml-2' : 'mr-2'} />
                  {extracting ? t.builder.extracting : t.builder.uploadDocument}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => photoInputRef.current?.click()}
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold"
                >
                  <FiImage className={isRTL ? 'ml-2' : 'mr-2'} />
                  {t.builder.uploadPhoto}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              {uploadedPhoto && (
                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block">
                  <p className="text-sm text-turquoise-100 mb-3 font-semibold">{t.builder.photoPreview}:</p>
                  <img 
                    src={uploadedPhoto} 
                    alt={t.builder.photoAlt} 
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl" 
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* CV Title */}
        <Card className="border-l-4 border-turquoise-500 shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-bold text-navy-900 mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-turquoise-600" />
            {t.builder.cvTitle}
          </h2>
          <Input
            value={cvData.title}
            onChange={(e) => setCvData({ ...cvData, title: e.target.value })}
            placeholder={t.builder.placeholders.cvTitle}
            className="text-lg font-semibold"
          />
        </Card>

        {/* Personal Information */}
        <Card className="border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <FiCheckCircle className="text-purple-600" />
              {t.builder.personalInfo}
            </h2>
            <p className="text-gray-600 mt-2">{t.builder.personalInfoDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t.builder.fullName + " *"}
              value={cvData.personalInfo.name}
              onChange={(e) =>
                setCvData({
                  ...cvData,
                  personalInfo: { ...cvData.personalInfo, name: e.target.value },
                })
              }
              placeholder={t.builder.placeholders.name}
            />
            <Input
              label={t.builder.email + " *"}
              type="email"
              value={cvData.personalInfo.email}
              onChange={(e) =>
                setCvData({
                  ...cvData,
                  personalInfo: { ...cvData.personalInfo, email: e.target.value },
                })
              }
              placeholder={t.builder.placeholders.email}
            />
            <Input
              label={t.builder.phone}
              value={cvData.personalInfo.phone}
              onChange={(e) =>
                setCvData({
                  ...cvData,
                  personalInfo: { ...cvData.personalInfo, phone: e.target.value },
                })
              }
              placeholder={t.builder.placeholders.phone}
            />
            <Input
              label={t.builder.location}
              value={cvData.personalInfo.location}
              onChange={(e) =>
                setCvData({
                  ...cvData,
                  personalInfo: { ...cvData.personalInfo, location: e.target.value },
                })
              }
              placeholder={t.builder.placeholders.location}
            />
          </div>
        </Card>

        {/* Professional Summary with AI */}
        <Card className="border-l-4 border-turquoise-500 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-white to-turquoise-50">
          <div className="mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                  <FiZap className="text-turquoise-600" />
                  {t.builder.summary}
                </h2>
                <p className="text-gray-600 mt-2">{t.builder.summaryDesc}</p>
              </div>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleAISuggest('summary')}
                loading={aiSuggestLoading['summary']}
                className="border-2 border-turquoise-500 text-turquoise-700 hover:bg-turquoise-50 font-semibold whitespace-nowrap"
              >
                <FiZap className={isRTL ? 'ml-2' : 'mr-2'} />
                {aiSuggestLoading['summary'] ? t.builder.generating : t.builder.aiSuggest}
              </Button>
            </div>
          </div>
          <Textarea
            value={cvData.summary}
            onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
            rows={5}
            placeholder={t.builder.summaryPlaceholder}
            className="text-base"
          />
        </Card>

        {/* Work Experience */}
        <Card className="border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                  <FiCheckCircle className="text-purple-600" />
                  {t.builder.experience}
                </h2>
                <p className="text-gray-600 mt-2">{t.builder.experienceDesc}</p>
              </div>
              <Button size="lg" onClick={addExperience} className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
                <FiPlus className={isRTL ? 'ml-2' : 'mr-2'} />
                {t.builder.addExperience}
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            {cvData.experience.map((exp, index) => (
              <div key={index} className="border-2 border-purple-200 rounded-xl p-6 relative bg-gradient-to-br from-white to-purple-50 hover:shadow-lg transition-shadow">
                <button
                  onClick={() => removeExperience(index)}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-3 hover:bg-red-600 shadow-lg z-10 hover:scale-110 transition-transform"
                  title={t.builder.remove}
                >
                  <FiTrash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label={t.builder.position + " *"}
                    value={exp.position}
                    onChange={(e) => {
                      const newExp = [...cvData.experience];
                      newExp[index].position = e.target.value;
                      setCvData({ ...cvData, experience: newExp });
                    }}
                    placeholder={t.builder.placeholders.position}
                  />
                  <Input
                    label={t.builder.company + " *"}
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...cvData.experience];
                      newExp[index].company = e.target.value;
                      setCvData({ ...cvData, experience: newExp });
                    }}
                    placeholder={t.builder.placeholders.company}
                  />
                  <Input
                    label={t.builder.location}
                    value={exp.location}
                    onChange={(e) => {
                      const newExp = [...cvData.experience];
                      newExp[index].location = e.target.value;
                      setCvData({ ...cvData, experience: newExp });
                    }}
                    placeholder={t.builder.placeholders.companyLocation}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t.builder.startDate}
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[index].startDate = e.target.value;
                        setCvData({ ...cvData, experience: newExp });
                      }}
                      placeholder={t.builder.placeholders.dateFormat}
                    />
                    <Input
                      label={t.builder.endDate}
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExp = [...cvData.experience];
                        newExp[index].endDate = e.target.value;
                        setCvData({ ...cvData, experience: newExp });
                      }}
                      placeholder={t.builder.present}
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-700">{t.builder.description} *</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAISuggest('experience_description', index)}
                      disabled={!exp.position || !exp.company}
                      loading={aiSuggestLoading[`experience_description-${index}`]}
                      className="border-2 border-turquoise-500 text-turquoise-700 hover:bg-turquoise-50"
                    >
                      <FiZap className={isRTL ? 'ml-1' : 'mr-1'} size={14} />
                      {aiSuggestLoading[`experience_description-${index}`] ? t.builder.generating : t.builder.aiSuggest}
                    </Button>
                  </div>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...cvData.experience];
                      newExp[index].description = e.target.value;
                      setCvData({ ...cvData, experience: newExp });
                    }}
                    rows={4}
                    placeholder={t.builder.descriptionPlaceholder}
                  />
                </div>
              </div>
            ))}
            {cvData.experience.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200">
                <FiPlus size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg">{t.builder.emptyStates.noExperience}</p>
                <p className="text-sm mt-2">{t.builder.emptyStates.noExperienceCta}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Education */}
        <Card className="border-l-4 border-turquoise-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                  <FiCheckCircle className="text-turquoise-600" />
                  {t.builder.education}
                </h2>
                <p className="text-gray-600 mt-2">{t.builder.educationDesc}</p>
              </div>
              <Button size="lg" onClick={addEducation} className="bg-turquoise-600 hover:bg-turquoise-700 whitespace-nowrap">
                <FiPlus className={isRTL ? 'ml-2' : 'mr-2'} />
                {t.builder.addEducation}
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            {cvData.education.map((edu, index) => (
              <div key={index} className="border-2 border-turquoise-200 rounded-xl p-6 relative bg-gradient-to-br from-white to-turquoise-50 hover:shadow-lg transition-shadow">
                <button
                  onClick={() => removeEducation(index)}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-3 hover:bg-red-600 shadow-lg z-10 hover:scale-110 transition-transform"
                  title={t.builder.remove}
                >
                  <FiTrash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label={t.builder.institution + " *"}
                    value={edu.institution}
                    onChange={(e) => {
                      const newEdu = [...cvData.education];
                      newEdu[index].institution = e.target.value;
                      setCvData({ ...cvData, education: newEdu });
                    }}
                    placeholder={t.builder.placeholders.university}
                  />
                  <Input
                    label={t.builder.degree + " *"}
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...cvData.education];
                      newEdu[index].degree = e.target.value;
                      setCvData({ ...cvData, education: newEdu });
                    }}
                    placeholder={t.builder.placeholders.degree}
                  />
                  <Input
                    label={t.builder.field + " *"}
                    value={edu.field}
                    onChange={(e) => {
                      const newEdu = [...cvData.education];
                      newEdu[index].field = e.target.value;
                      setCvData({ ...cvData, education: newEdu });
                    }}
                    placeholder={t.builder.placeholders.fieldOfStudy}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t.builder.startDate}
                      value={edu.startDate}
                      onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[index].startDate = e.target.value;
                        setCvData({ ...cvData, education: newEdu });
                      }}
                      placeholder="2016"
                    />
                    <Input
                      label={t.builder.endDate}
                      value={edu.endDate}
                      onChange={(e) => {
                        const newEdu = [...cvData.education];
                        newEdu[index].endDate = e.target.value;
                        setCvData({ ...cvData, education: newEdu });
                      }}
                      placeholder="2020"
                    />
                  </div>
                </div>
              </div>
            ))}
            {cvData.education.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-turquoise-50 rounded-xl border-2 border-dashed border-turquoise-200">
                <FiPlus size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg">{t.builder.emptyStates.noEducation}</p>
                <p className="text-sm mt-2">{t.builder.emptyStates.noEducationCta}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Skills */}
        <Card className="border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                  <FiCheckCircle className="text-purple-600" />
                  {t.builder.skills}
                </h2>
                <p className="text-gray-600 mt-2">{t.builder.skillsDesc}</p>
              </div>
              <Button size="lg" onClick={addSkill} className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
                <FiPlus className={isRTL ? 'ml-2' : 'mr-2'} />
                {t.builder.addSkill}
              </Button>
            </div>
          </div>
          <div className="space-y-5">
            {cvData.skills.map((skill, index) => (
              <div key={index} className="flex gap-4 items-start bg-gradient-to-r from-white to-purple-50 p-5 rounded-xl border-2 border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label={t.builder.category}
                    value={skill.category}
                    onChange={(e) => {
                      const newSkills = [...cvData.skills];
                      newSkills[index].category = e.target.value;
                      setCvData({ ...cvData, skills: newSkills });
                    }}
                    placeholder={t.builder.placeholders.skillCategory}
                  />
                  <Input
                    label={t.builder.skillsList}
                    value={Array.isArray(skill.skillsList) ? skill.skillsList.join(', ') : skill.skillsList}
                    onChange={(e) => {
                      const newSkills = [...cvData.skills];
                      newSkills[index].skillsList = e.target.value.split(',').map((s: string) => s.trim());
                      setCvData({ ...cvData, skills: newSkills });
                    }}
                    placeholder={t.builder.placeholders.skillsExample}
                  />
                </div>
                <button
                  onClick={() => removeSkill(index)}
                  className="mt-7 bg-red-500 text-white rounded-full p-3 hover:bg-red-600 hover:scale-110 transition-transform"
                  title={t.builder.remove}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
            {cvData.skills.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200">
                <FiPlus size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg">{t.builder.emptyStates.noSkills}</p>
                <p className="text-sm mt-2">{t.builder.emptyStates.noSkillsCta}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Save Button - Prominent */}
        <div className="flex justify-center pb-12 pt-6">
          <Button 
            size="lg" 
            onClick={handleSave} 
            loading={saving}
            className="bg-gradient-to-r from-turquoise-600 to-purple-600 hover:from-turquoise-700 hover:to-purple-700 text-white font-bold text-lg px-12 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
          >
            <FiSave className={`${isRTL ? 'ml-3' : 'mr-3'}`} size={24} />
            {saving ? t.common.loading : (cvId ? t.builder.updateCV : t.builder.save)}
          </Button>
        </div>
      </div>
    </div>
  );
}
