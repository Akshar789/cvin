'use client';

import { useState } from 'react';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';

// Saudi Candidate Sample Data
const saudiSampleData = {
  title: 'Professional Resume',
  personalInfo: {
    name: 'أحمد العالي | Ahmed Alali',
    email: 'ahmed.alali@email.com',
    phone: '050 2002 0020',
    location: 'Riyadh, Saudi Arabia',
    photo: '',
  },
  summary: 'Experienced Education Management Professional with 8+ years in leading educational initiatives, strategic planning, and operational management. Proven expertise in student affairs, staff development, and delivering high-quality education. Skilled in managing diverse teams, implementing training programs, and improving organizational performance.',
  experience: [
    {
      company: 'Dairy & Food Polytechnic - Almarai',
      position: 'Trainee Affairs & Services Manager',
      location: 'Riyadh Province',
      startDate: 'Aug 2017',
      endDate: 'Present',
      description: 'Manage overall functioning and performance of the department with strategic focus on staff training and student services.',
      achievements: [
        'Led comprehensive staff training programs improving department efficiency by 35%',
        'Developed and implemented strategic operational plans for training delivery',
        'Managed recruitment workflow and staff leadership development initiatives',
        'Established policies and procedures improving student services and compliance',
      ],
    },
    {
      company: 'Niagara College (International College of Taif)',
      position: 'Student Life Advisor',
      location: 'Taif',
      startDate: 'Feb 2017',
      endDate: 'Aug 2017',
      description: 'Provided comprehensive student services and academic support.',
      achievements: [
        'Counseled 200+ students on academic matters and career development',
        'Organized student compliance initiatives and monitoring programs',
        'Developed and implemented engagement & counseling frameworks',
      ],
    },
    {
      company: 'Mondragon Education (International Technical College)',
      position: 'Student Affairs Officer',
      location: 'Muhayil Asir Province',
      startDate: 'Sep 2014',
      endDate: 'Feb 2017',
      description: 'Coordinated student services and admission processes.',
      achievements: [
        'Managed admission and communication with 300+ students',
        'Organized counseling sessions and student activities',
        'Maintained and monitored student compliance databases',
      ],
    },
  ],
  education: [
    {
      institution: 'King Khalid University - Abha',
      degree: 'Bachelor of Science',
      field: 'English Literature',
      startDate: '2009',
      endDate: '2013',
      description: 'Saudi Arabia',
    },
  ],
  skills: [
    {
      category: 'Communication',
      skillsList: ['Leadership', 'Student Engagement', 'Team Management', 'Training Development'],
    },
    {
      category: 'Technical',
      skillsList: ['Microsoft Office', 'Educational Planning', 'Staff Development', 'Database Management'],
    },
    {
      category: 'Languages',
      skillsList: ['Arabic (Native)', 'English (Fluent)'],
    },
  ],
};

export default function CVShowcase() {
  const [activeTemplate, setActiveTemplate] = useState<'ats' | 'attractive'>('attractive');

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            See What Your CV Will Look Like
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from professional templates designed to impress recruiters and pass ATS systems.
            Start free with our clean ATS template, or upgrade for stunning designs.
          </p>
        </div>

        {/* Template Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* ATS CV Card */}
          <div 
            onClick={() => setActiveTemplate('ats')}
            className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${
              activeTemplate === 'ats' 
                ? 'border-indigo-600 shadow-2xl' 
                : 'border-gray-200 shadow-lg hover:shadow-xl hover:border-indigo-300'
            }`}
          >
            <div className="bg-white aspect-video overflow-hidden">
              <div className="w-full h-full bg-white p-4 flex flex-col text-xs text-gray-800 font-mono">
                <div className="font-bold mb-2">AHMED ALALI</div>
                <div className="text-gray-600 mb-1">ahmed.alali@email.com | 050 2002 0020</div>
                <div className="text-gray-600 mb-3">Riyadh, Saudi Arabia</div>
                <div className="border-t border-gray-300 pt-2 mb-2">
                  <div className="font-bold mb-1">PROFESSIONAL SUMMARY</div>
                  <div className="text-gray-700 leading-tight line-clamp-3">Experienced Education Management Professional with 8+ years in leading educational initiatives...</div>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="font-bold mb-1">EXPERIENCE</div>
                  <div className="text-gray-700 leading-tight">Trainee Affairs & Services Manager - Dairy & Food Polytechnic</div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">ATS CV (Free)</h3>
              <p className="text-gray-600">Clean, simple black & white format optimized for Applicant Tracking Systems. Perfect for large corporations.</p>
              <div className="mt-4 inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold">
                Available for all users
              </div>
            </div>
          </div>

          {/* Attractive CV Card */}
          <div 
            onClick={() => setActiveTemplate('attractive')}
            className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${
              activeTemplate === 'attractive' 
                ? 'border-purple-600 shadow-2xl' 
                : 'border-gray-200 shadow-lg hover:shadow-xl hover:border-purple-300'
            }`}
          >
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 aspect-video overflow-hidden">
              <div className="w-full h-full text-white p-4 flex flex-col text-xs">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-400 rounded-lg flex-shrink-0"></div>
                  <div>
                    <div className="font-bold text-lg">Ahmed Alali</div>
                    <div className="text-orange-400 text-xs">Education Management Professional</div>
                  </div>
                  <div className="ml-auto text-right text-xs">
                    <div>Riyadh, KSA</div>
                    <div>050 2002 0020</div>
                  </div>
                </div>
                <div className="border-t border-orange-400 mt-3 pt-2 flex-1">
                  <div className="font-bold mb-1">Professional Summary</div>
                  <div className="text-gray-100 text-xs leading-tight">Experienced in leading educational initiatives and strategic planning...</div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Attractive CV (Pro)</h3>
              <p className="text-gray-600">Eye-catching design with colors and professional formatting. Stand out from other candidates.</p>
              <div className="mt-4 inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                Pro tier feature
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-6">
            Start free with the ATS template. Upgrade to Pro anytime to unlock more stunning designs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/register" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all">
              Start Free Now
            </a>
            <a href="#pricing" className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all">
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
