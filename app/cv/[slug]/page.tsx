'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function PublicCVPage() {
  const params = useParams();
  const slug = params?.slug;
  const [cv, setCV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchCV();
    }
  }, [slug]);

  const fetchCV = async () => {
    try {
      const response = await axios.get(`/api/cvs/public/${slug}`);
      setCV(response.data.cv);
    } catch (err: any) {
      setError(err.response?.data?.error || 'CV not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">CV Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This CV does not exist or is not public'}</p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const personalInfo = cv.personalInfo || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold text-navy-900 cursor-pointer">CVin</h1>
          </Link>
          <Link href="/builder">
            <Button size="sm">Create Your CV</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-white print:shadow-none">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-navy-900 mb-2">
              {personalInfo.name || 'Name'}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
            </div>
          </div>

          {cv.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-3 border-b-2 border-turquoise-500 pb-2">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{cv.summary}</p>
            </div>
          )}

          {cv.experience && cv.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b-2 border-turquoise-500 pb-2">
                Experience
              </h2>
              <div className="space-y-6">
                {cv.experience.map((exp: any, index: number) => (
                  <div key={index}>
                    <h3 className="text-xl font-bold text-navy-900">{exp.position}</h3>
                    <p className="text-lg text-gray-700">{exp.company}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      {exp.startDate} - {exp.endDate || 'Present'}
                      {exp.location && ` | ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cv.education && cv.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b-2 border-turquoise-500 pb-2">
                Education
              </h2>
              <div className="space-y-4">
                {cv.education.map((edu: any, index: number) => (
                  <div key={index}>
                    <h3 className="text-xl font-bold text-navy-900">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-lg text-gray-700">{edu.institution}</p>
                    <p className="text-sm text-gray-600">
                      {edu.startDate} - {edu.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cv.skills && cv.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4 border-b-2 border-turquoise-500 pb-2">
                Skills
              </h2>
              <div className="space-y-3">
                {cv.skills.map((skill: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-900 mb-1">{skill.category}</h3>
                    <p className="text-gray-700">
                      {Array.isArray(skill.skillsList)
                        ? skill.skillsList.join(', ')
                        : skill.skillsList}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Create your own professional CV with CVin</p>
          <Link href="/builder">
            <Button size="lg">Start Building Free</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
