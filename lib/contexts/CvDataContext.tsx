'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  headline?: string;
  photoUrl?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current?: boolean;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface Skill {
  id: string;
  category: string;
  skillsList: string[];
}

interface Language {
  id: string;
  name: string;
  level: string;
}

interface Course {
  id: string;
  name: string;
  institution?: string;
  date?: string;
}

interface CVData {
  id: number;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  courses: Course[];
  updatedAt?: string;
  isGuest?: boolean;
  templateId?: string | number;
}

interface LinkedInData {
  headline: string;
  about: string;
  experience: Array<{
    title: string;
    company: string;
    description: string;
    duration: string;
  }>;
  skills: string[];
  targetJobDomain?: string;
  name?: string;
  professionalSummary?: string;
}

interface InterviewData {
  jobTitle: string;
  industry: string;
  skills: string[];
  experience: Array<{
    role: string;
    responsibilities: string;
  }>;
  yearsOfExperience: number;
}

interface CareerProfile {
  name: string;
  email: string;
  currentRole?: string;
  targetRole?: string;
  industry?: string;
  yearsOfExperience?: string;
  careerLevel?: string;
  topSkills: string[];
  education: string[];
  goals?: string;
}

interface CvDataContextType {
  cvs: CVData[];
  primaryCv: CVData | null;
  loading: boolean;
  error: string | null;
  refreshCvs: () => Promise<void>;
  setPrimaryCv: (cvId: number) => void;
  getCvForLinkedIn: (cvId?: number) => LinkedInData | null;
  getCvForInterview: (cvId?: number) => InterviewData | null;
  getUserCareerProfile: () => CareerProfile;
}

const CvDataContext = createContext<CvDataContextType | undefined>(undefined);

export function CvDataProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [cvs, setCvs] = useState<CVData[]>([]);
  const [primaryCv, setPrimaryCvState] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      refreshCvs();
    } else {
      // Clear sensitive CV data when user logs out or token is invalid
      setCvs([]);
      setPrimaryCvState(null);
      setError(null);
      setLoading(false);
    }
  }, [user, token]);

  const refreshCvs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cvsResponse = await axios.get('/api/cvs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedCvs = cvsResponse.data.cvs || [];

      const allCvs = [...fetchedCvs];
      setCvs(allCvs);

      if (allCvs.length > 0) {
        const firstUserCv = fetchedCvs.length > 0 ? fetchedCvs[0] : allCvs[0];
        setPrimaryCvState(firstUserCv);
      } else {
        setPrimaryCvState(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch CVs:', err);
      setError(err.response?.data?.error || 'Failed to load CVs');
      setCvs([]);
      setPrimaryCvState(null);
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryCv = (cvId: number) => {
    const cv = cvs.find((c) => c.id === cvId);
    if (cv) {
      setPrimaryCvState(cv);
    }
  };

  const getCvForLinkedIn = (cvId?: number): LinkedInData | null => {
    const targetCv = cvId ? cvs.find((c) => c.id === cvId) : primaryCv;
    if (!targetCv) return null;

    const allSkills: string[] = [];
    if (Array.isArray(targetCv.skills)) {
      targetCv.skills.forEach((skillGroup: any) => {
        if (Array.isArray(skillGroup.skillsList)) {
          allSkills.push(...skillGroup.skillsList);
        } else if (Array.isArray(skillGroup.technical)) {
          allSkills.push(...skillGroup.technical);
        } else if (Array.isArray(skillGroup.soft)) {
          allSkills.push(...skillGroup.soft);
        } else if (Array.isArray(skillGroup.tools)) {
          allSkills.push(...skillGroup.tools);
        }
      });
    }

    const experiences = targetCv.experience || [];
    
    return {
      headline: (targetCv.personalInfo as any).headline || 
                (experiences[0]?.position || 'Professional'),
      about: targetCv.summary || '',
      experience: experiences.map((exp: any) => ({
        title: exp.position,
        company: exp.company,
        description: exp.description || (exp.responsibilities || []).join('. '),
        duration: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
      })),
      skills: allSkills,
      targetJobDomain: (targetCv.personalInfo as any).targetJobDomain || '',
      name: (targetCv.personalInfo as any).fullName || targetCv.personalInfo.name || '',
      professionalSummary: targetCv.summary || '',
    };
  };

  const getCvForInterview = (cvId?: number): InterviewData | null => {
    const targetCv = cvId ? cvs.find((c) => c.id === cvId) : primaryCv;
    if (!targetCv) return null;

    const allSkills: string[] = [];
    if (Array.isArray(targetCv.skills)) {
      targetCv.skills.forEach((skillGroup) => {
        if (Array.isArray(skillGroup.skillsList)) {
          allSkills.push(...skillGroup.skillsList);
        }
      });
    }

    const calculateYearsOfExperience = (): number => {
      if (!targetCv.experience || targetCv.experience.length === 0) return 0;
      
      const sortedExp = [...targetCv.experience].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      
      const firstJob = sortedExp[sortedExp.length - 1];
      const firstJobDate = new Date(firstJob.startDate);
      const today = new Date();
      
      return Math.floor((today.getTime() - firstJobDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    };

    const experiences = targetCv.experience || [];
    const currentRole = experiences.find((exp) => exp.current);
    const latestRole = experiences[0];
    const industry = user?.industry || 'Technology';

    return {
      jobTitle: currentRole?.position || latestRole?.position || 'Professional',
      industry,
      skills: allSkills,
      experience: (targetCv.experience || []).map((exp) => ({
        role: exp.position,
        responsibilities: exp.description,
      })),
      yearsOfExperience: calculateYearsOfExperience(),
    };
  };

  const getUserCareerProfile = (): CareerProfile => {
    const allSkills: string[] = [];
    if (primaryCv && Array.isArray(primaryCv.skills)) {
      primaryCv.skills.forEach((skillGroup) => {
        if (Array.isArray(skillGroup.skillsList)) {
          allSkills.push(...skillGroup.skillsList);
        }
      });
    }

    const education: string[] = [];
    if (primaryCv && Array.isArray(primaryCv.education)) {
      primaryCv.education.forEach((edu) => {
        education.push(`${edu.degree} in ${edu.field} from ${edu.institution}`);
      });
    }

    const currentRole = primaryCv?.experience?.find((exp) => exp.current);
    const latestRole = primaryCv?.experience?.[0];

    return {
      name: user?.fullName || primaryCv?.personalInfo?.name || '',
      email: user?.email || primaryCv?.personalInfo?.email || '',
      currentRole: currentRole?.position || latestRole?.position,
      targetRole: user?.targetJobTitle,
      industry: user?.industry,
      yearsOfExperience: user?.yearsOfExperience,
      careerLevel: user?.careerLevel,
      topSkills: allSkills.slice(0, 10),
      education,
      goals: user?.targetJobTitle ? `Transition to ${user.targetJobTitle}` : undefined,
    };
  };

  const value: CvDataContextType = {
    cvs,
    primaryCv,
    loading,
    error,
    refreshCvs,
    setPrimaryCv,
    getCvForLinkedIn,
    getCvForInterview,
    getUserCareerProfile,
  };

  return <CvDataContext.Provider value={value}>{children}</CvDataContext.Provider>;
}

export function useCvData() {
  const context = useContext(CvDataContext);
  if (context === undefined) {
    throw new Error('useCvData must be used within a CvDataProvider');
  }
  return context;
}
