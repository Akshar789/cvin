'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiUser, FiFileText, FiBriefcase, FiBook, FiAward, FiGlobe, FiTarget } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import AiActionButtons from './AiActionButtons';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';

interface ContentFormSectionProps {
  section: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'courses' | 'languages';
  isPremium: boolean;
  data: any;
  onUpdate: (data: any) => void;
}

export default function ContentFormSection({
  section,
  isPremium,
  data,
  onUpdate,
}: ContentFormSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const { token, user } = useAuth();

  const handleGenerate = async () => {
    if (!token) {
      setError('Please log in to use AI features');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fieldType = '';
      let context: any = {};

      switch (section) {
        case 'summary':
          fieldType = 'summary';
          context = {
            targetRole: user?.targetJobTitle || 'Professional',
            industry: user?.industry || '',
            yearsOfExperience: user?.yearsOfExperience || '',
          };
          break;
        case 'skills':
          fieldType = 'skills';
          context = {
            targetRole: user?.targetJobTitle || '',
            industry: user?.industry || '',
            existingSkills: Array.isArray(data) ? data : [],
          };
          break;
        default:
          setError('AI generation not available for this section');
          setLoading(false);
          return;
      }

      const response = await axios.post(
        '/api/ai/suggest-field',
        {
          fieldType,
          currentValue: section === 'summary' ? data : '',
          context,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const suggestion = response.data.suggestion;
      setCreditsRemaining(response.data.creditsRemaining);

      if (section === 'summary') {
        onUpdate(suggestion);
      } else if (section === 'skills') {
        const newSkills = suggestion
          .split(/[,\n]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s && s.length > 0);
        onUpdate([...new Set([...(Array.isArray(data) ? data : []), ...newSkills])]);
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      const errorMsg = err.response?.data?.error;
      
      if (errorMsg?.includes('Upgrade to Pro')) {
        setError(errorMsg);
        setCreditsRemaining(err.response?.data?.creditsRemaining || 0);
      } else if (err.response?.data?.error === 'SUBSCRIPTION_REQUIRED') {
        setError('Please upgrade to use AI features');
      } else {
        setError(errorMsg || 'Failed to generate content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!token) {
      setError('Please log in to use AI features');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentText = section === 'summary' ? data : '';
      
      if (!currentText || currentText.trim() === '') {
        setError('Please enter some text first to improve');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        '/api/ai/improve-text',
        {
          text: currentText,
          context: `This is a professional ${section} for a CV/resume`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdate(response.data.improvedText);
    } catch (err: any) {
      console.error('AI improvement error:', err);
      if (err.response?.data?.error === 'SUBSCRIPTION_REQUIRED') {
        setError('Please upgrade to use AI features');
      } else {
        setError('Failed to improve content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPersonal = () => (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Full Name"
        value={data.name || ''}
        onChange={(e) => onUpdate({ ...data, name: e.target.value })}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="email"
        placeholder="Email"
        value={data.email || ''}
        onChange={(e) => onUpdate({ ...data, email: e.target.value })}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="tel"
        placeholder="Phone"
        value={data.phone || ''}
        onChange={(e) => onUpdate({ ...data, phone: e.target.value })}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Location"
        value={data.location || ''}
        onChange={(e) => onUpdate({ ...data, location: e.target.value })}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderSummary = () => (
    <textarea
      placeholder="Write your professional summary..."
      value={data || ''}
      onChange={(e) => onUpdate(e.target.value)}
      rows={4}
      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  );

  const renderExperience = () => {
    const items = Array.isArray(data) ? data : [];
    return (
    <div className="space-y-4">
      {items.map((exp: any, idx: number) => (
        <div key={exp.id} className="p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold">Experience #{idx + 1}</h4>
            <button
              onClick={() => onUpdate(items.filter((_: any, i: number) => i !== idx))}
              className="text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Company"
            value={exp.company || ''}
            onChange={(e) => {
              const updated = [...items];
              updated[idx].company = e.target.value;
              onUpdate(updated);
            }}
            className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Position"
            value={exp.position || ''}
            onChange={(e) => {
              const updated = [...items];
              updated[idx].position = e.target.value;
              onUpdate(updated);
            }}
            className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Start Date (e.g. Jan 2020)"
              value={exp.startDate || ''}
              onChange={(e) => {
                const updated = [...items];
                updated[idx].startDate = e.target.value;
                onUpdate(updated);
              }}
              className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="End Date (or 'Present')"
              value={exp.endDate || ''}
              onChange={(e) => {
                const updated = [...items];
                updated[idx].endDate = e.target.value;
                onUpdate(updated);
              }}
              className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            placeholder="Description"
            value={exp.description || ''}
            onChange={(e) => {
              const updated = [...items];
              updated[idx].description = e.target.value;
              onUpdate(updated);
            }}
            rows={2}
            className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <Button
        onClick={() =>
          onUpdate([
            ...items,
            {
              id: Date.now().toString(),
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              description: '',
            },
          ])
        }
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <FiPlus className="w-4 h-4" /> Add Experience
      </Button>
    </div>
    );
  };

  const renderEducation = () => {
    const items = Array.isArray(data) ? data : [];
    return (
    <div className="space-y-4">
      {items.map((edu: any, idx: number) => (
        <div key={edu.id} className="p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold">Education #{idx + 1}</h4>
            <button
              onClick={() => onUpdate(items.filter((_: any, i: number) => i !== idx))}
              className="text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Degree (e.g. Bachelor's)"
            value={edu.degree || ''}
            onChange={(e) => {
              const updated = [...items];
              updated[idx].degree = e.target.value;
              onUpdate(updated);
            }}
            className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Field of Study"
            value={edu.field || ''}
            onChange={(e) => {
              const updated = [...items];
              updated[idx].field = e.target.value;
              onUpdate(updated);
            }}
            className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Institution"
            value={edu.institution || ''}
            onChange={(e) => {
              const updated = [...items];
              updated[idx].institution = e.target.value;
              onUpdate(updated);
            }}
            className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="End Date (e.g. 2023)"
              value={edu.endDate || ''}
              onChange={(e) => {
                const updated = [...items];
                updated[idx].endDate = e.target.value;
                onUpdate(updated);
              }}
              className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="GPA (optional)"
              value={edu.gpa || ''}
              onChange={(e) => {
                const updated = [...items];
                updated[idx].gpa = e.target.value;
                onUpdate(updated);
              }}
              className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}
      <Button
        onClick={() =>
          onUpdate([
            ...items,
            {
              id: Date.now().toString(),
              degree: '',
              field: '',
              institution: '',
              endDate: '',
              gpa: '',
            },
          ])
        }
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <FiPlus className="w-4 h-4" /> Add Education
      </Button>
    </div>
    );
  };

  const renderSkills = () => (
    <div className="space-y-4">
      <textarea
        placeholder="Enter skills separated by commas (e.g. Leadership, Communication, Project Management)"
        value={Array.isArray(data) ? data.join(', ') : ''}
        onChange={(e) => {
          const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
          onUpdate(skills);
        }}
        rows={3}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex flex-wrap gap-2">
        {Array.isArray(data) && data.map((skill: string, idx: number) => (
          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-4">
      <textarea
        placeholder="Enter courses/certifications, one per line"
        value={Array.isArray(data) ? data.join('\n') : ''}
        onChange={(e) => {
          const courses = e.target.value.split('\n').map(c => c.trim()).filter(c => c);
          onUpdate(courses);
        }}
        rows={5}
        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderLanguages = () => {
    const items = Array.isArray(data) ? data : [];
    return (
    <div className="space-y-4">
      {items.map((lang: any, idx: number) => (
        <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold">Language #{idx + 1}</h4>
            <button
              onClick={() => onUpdate(items.filter((_: any, i: number) => i !== idx))}
              className="text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Language (e.g. Arabic)"
              value={typeof lang === 'string' ? lang : (lang.name || '')}
              onChange={(e) => {
                const updated = [...items];
                updated[idx] = typeof lang === 'string' ? { name: e.target.value, level: 'Native' } : { ...lang, name: e.target.value };
                onUpdate(updated);
              }}
              className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Level (e.g. Native, Fluent)"
              value={typeof lang === 'string' ? 'Native' : (lang.level || '')}
              onChange={(e) => {
                const updated = [...items];
                updated[idx] = typeof lang === 'string' ? { name: lang, level: e.target.value } : { ...lang, level: e.target.value };
                onUpdate(updated);
              }}
              className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}
      <Button
        onClick={() => onUpdate([...items, { name: '', level: '' }])}
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <FiPlus className="w-4 h-4" /> Add Language
      </Button>
    </div>
    );
  };

  return (
    <div className="space-y-4">
      {section === 'personal' && renderPersonal()}
      {section === 'summary' && renderSummary()}
      {section === 'experience' && renderExperience()}
      {section === 'education' && renderEducation()}
      {section === 'skills' && renderSkills()}
      {section === 'courses' && renderCourses()}
      {section === 'languages' && renderLanguages()}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          {error?.includes('Upgrade to Pro') && (
            <div className="mt-2">
              <a href="/pricing" className="text-orange-600 hover:text-orange-700 font-semibold underline">
                View pricing plans →
              </a>
            </div>
          )}
        </div>
      )}

      {creditsRemaining !== null && creditsRemaining < 999 && (section === 'summary' || section === 'skills') && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-turquoise-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800 font-semibold">
            ⚡ {creditsRemaining > 0 
              ? `${creditsRemaining} free AI generation${creditsRemaining !== 1 ? 's' : ''} remaining`
              : 'No free AI generations remaining. Upgrade for unlimited access!'}
          </p>
        </div>
      )}

      {(section === 'summary' || section === 'skills') && (
        <AiActionButtons
          section={section}
          onGenerate={handleGenerate}
          onImprove={section === 'summary' ? handleImprove : undefined}
          loading={loading}
          isPremium={isPremium}
        />
      )}
    </div>
  );
}
