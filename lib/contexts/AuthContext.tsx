'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  phoneNumber?: string;
  location?: string;
  nationality?: string;
  linkedin?: string;
  subscriptionTier: string;
  subscriptionEndDate?: string | null;
  language: string;
  preferredLanguage?: string | null;
  onboardingCompleted?: boolean;
  targetJobTitle?: string;
  targetJobDomain?: string;
  industry?: string;
  yearsOfExperience?: string;
  careerLevel?: string;
  educationLevel?: string;
  degreeLevel?: string;
  educationSpecialization?: string;
  mostRecentJobTitle?: string;
  mostRecentCompany?: string;
  employmentStatus?: string;
  professionalSummary?: string;
  freeCredits?: number;
  cvGenerations?: number;
  textImprovements?: number;
  interviewSets?: number;
  strengths?: any[];
  careerInterests?: any[];
  oauthProvider?: string | null;
  oauthProviderId?: string | null;
  profilePicture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loggingOut: boolean;
  login: (email: string, password: string) => Promise<{ migratedCvId?: number | null }>;
  register: (data: any) => Promise<{ migratedCvId?: number | null }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('[AuthContext] Received user data:', response.data.user);
      console.log('[AuthContext] professionalSummary from response:', response.data.user?.professionalSummary);
      setUser(response.data.user);
      console.log('[AuthContext] User state updated');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 404) {
        console.log('[AuthContext] Token invalid or user not found, clearing session');
      } else {
        console.error('[AuthContext] Error fetching user:', error);
      }
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ migratedCvId?: number | null }> => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, migratedCvId } = response.data;
      if (!newToken) {
        throw new Error('No token received from server');
      }
      localStorage.setItem('token', newToken);
      setToken(newToken);
      await fetchUser(newToken);
      return { migratedCvId: migratedCvId || null };
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      if (error.response) {
        throw new Error(error.response.data?.error || 'Login failed');
      }
      throw error;
    }
  };

  const register = async (data: any): Promise<{ migratedCvId?: number | null }> => {
    const response = await axios.post('/api/auth/register', data);
    const { token: newToken, user: userData, migratedCvId } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return { migratedCvId: migratedCvId || null };
  };

  const logout = () => {
    setLoggingOut(true);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/template-gallery';
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loggingOut, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
