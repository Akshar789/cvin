'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FiX } from 'react-icons/fi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, register, refreshUser } = useAuth();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
  });

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        await fetch('/api/auth/complete-onboarding', {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        await refreshUser();
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || t.auth.loginFailed || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { migratedCvId } = await register(registerData);
      if (migratedCvId && typeof window !== 'undefined') {
        sessionStorage.setItem('migratedCvId', String(migratedCvId));
      }
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        await fetch('/api/auth/complete-onboarding', {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        await refreshUser();
      }
      onSuccess();
    } catch (err: any) {
      const apiError = err?.response?.data?.error;
      setError(apiError || t.auth.registrationFailed || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 pt-5 pb-4 z-10">
          <button
            onClick={onClose}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1 rounded-full hover:bg-gray-100 transition-colors`}
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-xl font-bold text-gray-900 text-center">
            {isRTL ? 'أنشئ حسابك وابدأ الخطة المجانية' : 'Create Account & Start Free Plan'}
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            {isRTL ? 'سجل الدخول أو أنشئ حسابًا لتحميل سيرتك الذاتية' : 'Sign in or create an account to download your CV'}
          </p>

          <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.auth.login || (isRTL ? 'تسجيل الدخول' : 'Login')}
            </button>
            <button
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.auth.register || (isRTL ? 'إنشاء حساب' : 'Sign Up')}
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label={t.auth.email || (isRTL ? 'البريد الإلكتروني' : 'Email')}
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
              <Input
                type="password"
                label={t.auth.password || (isRTL ? 'كلمة المرور' : 'Password')}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
              <Button type="submit" fullWidth loading={loading}>
                {t.auth.login || (isRTL ? 'تسجيل الدخول' : 'Login')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="text"
                label={t.auth.fullName || (isRTL ? 'الاسم الكامل' : 'Full Name')}
                value={registerData.fullName}
                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                required
                placeholder={isRTL ? 'أحمد محمد' : 'John Doe'}
              />
              <Input
                type="text"
                label={t.auth.username || (isRTL ? 'اسم المستخدم' : 'Username')}
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
                placeholder={isRTL ? 'ahmadm' : 'johndoe'}
              />
              <Input
                type="email"
                label={t.auth.email || (isRTL ? 'البريد الإلكتروني' : 'Email')}
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
              <Input
                type="password"
                label={t.auth.password || (isRTL ? 'كلمة المرور' : 'Password')}
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                placeholder="••••••••"
                helperText={t.auth.passwordHelper}
              />
              <Button type="submit" fullWidth loading={loading}>
                {loading
                  ? (t.auth.creatingAccount || (isRTL ? 'جاري الإنشاء...' : 'Creating...'))
                  : (t.auth.completeRegistration || (isRTL ? 'إنشاء حساب' : 'Create Account'))}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
