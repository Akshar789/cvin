'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import { FiStar, FiCheck, FiLock } from 'react-icons/fi';

const sampleData = {
  title: 'Your Professional CV',
  personalInfo: {
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: 'Your Phone Number',
    location: 'Your Location',
    photo: '',
  },
  summary: 'Your professional summary highlighting your key achievements, skills, and career objectives. Showcase your unique value proposition and what makes you stand out as a candidate.',
  experience: [
    {
      company: 'Company Name',
      position: 'Your Job Title',
      location: 'City, Country',
      startDate: 'Start Date',
      endDate: 'End Date',
      description: 'Brief description of your role and responsibilities in this position.',
      achievements: [
        'Key achievement or responsibility demonstrating your impact',
        'Another accomplishment showing measurable results',
      ],
    },
  ],
  education: [
    {
      institution: 'University Name',
      degree: 'Degree Type',
      field: 'Field of Study',
      startDate: 'Start Year',
      endDate: 'End Year',
      description: '',
    },
  ],
  skills: [
    {
      category: 'Skill Category',
      skillsList: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
    },
  ],
};

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const templates = [
    {
      id: 5,
      name: 'Modern Professional',
      description: 'Clean, modern design with sidebar. Perfect for creative professionals.',
      component: <ModernTemplate data={sampleData} previewMode />,
      isPremium: false,
      tier: 'Free',
    },
    {
      id: 6,
      name: 'Classic Professional',
      description: 'Traditional centered layout. ATS-optimized and recruiter-friendly.',
      component: <ClassicTemplate data={sampleData} previewMode />,
      isPremium: true,
      tier: 'Premium',
    },
  ];

  const canUseTemplate = (isPremium: boolean) => {
    if (!isPremium) return true;
    if (!user) return false;
    return ['regular', 'plus', 'annual', 'premium', 'lifetime', 'yearly'].includes(user.subscriptionTier || '');
  };

  const handleSelectTemplate = (templateId: number, isPremium: boolean) => {
    if (!canUseTemplate(isPremium)) {
      router.push('/pricing');
      return;
    }
    setSelectedTemplate(templateId);
    router.push(`/builder?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">CV Templates</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our professionally designed templates. All optimized for ATS and designed to impress recruiters.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {templates.map((template) => {
            const hasAccess = canUseTemplate(template.isPremium);
            
            return (
              <div
                key={template.id}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${
                  !hasAccess ? 'opacity-75' : ''
                }`}
              >
                {/* Template Preview */}
                <div className="relative bg-gray-100 p-6 overflow-hidden max-h-[500px]">
                  {template.isPremium && (
                    <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <FiStar className="w-4 h-4" />
                      <span className="font-semibold text-sm">Premium</span>
                    </div>
                  )}
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex items-center justify-center">
                      <div className="bg-white rounded-2xl p-6 text-center">
                        <FiLock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Template</h3>
                        <p className="text-gray-600 mb-4">Upgrade to access this template</p>
                        <button
                          onClick={() => router.push('/pricing')}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700"
                        >
                          View Plans
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="transform scale-75 origin-top">
                    {template.component}
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{template.name}</h3>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        template.isPremium 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {template.tier}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{template.description}</p>

                  <button
                    onClick={() => handleSelectTemplate(template.id, template.isPremium)}
                    disabled={!hasAccess}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      hasAccess
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {hasAccess ? (
                      <>
                        <FiCheck className="w-5 h-5" />
                        Use This Template
                      </>
                    ) : (
                      <>
                        <FiLock className="w-5 h-5" />
                        Upgrade to Use
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Not sure which template to choose?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            All our templates are ATS-friendly and professionally designed. The Modern template works great for creative fields,
            while the Classic template is perfect for traditional industries.
          </p>
          <button
            onClick={() => router.push('/builder')}
            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
}
