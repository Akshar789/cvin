'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import axios from 'axios';

interface SocialLoginProps {
  callbackUrl?: string;
}

export default function SocialLogin({ callbackUrl = '/dashboard' }: SocialLoginProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attemptedSync = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user && !attemptedSync.current) {
      attemptedSync.current = true;
      syncSession();
    }
  }, [session, status]);

  const syncSession = async () => {
    try {
      const response = await axios.get('/api/auth/sync-session');
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      window.dispatchEvent(new Event('storage'));
      
      setTimeout(() => {
        router.push(callbackUrl);
      }, 100);
    } catch (err: any) {
      console.error('Failed to sync session:', err);
      setError(err.response?.data?.error || 'Failed to complete sign in. Please try again.');
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setError(null);
    attemptedSync.current = false;
    await signIn('google', { redirect: true });
  };

  const handleFacebookSignIn = async () => {
    setLoading('facebook');
    setError(null);
    attemptedSync.current = false;
    await signIn('facebook', { redirect: true });
  };

  const handleRetry = () => {
    setError(null);
    attemptedSync.current = false;
    syncSession();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t.auth.orContinueWith}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="text-sm text-red-800 hover:text-red-900 font-semibold underline"
          >
            {t.auth.retry}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          loading={loading === 'google'}
          disabled={!!loading}
          className="flex items-center justify-center gap-2"
        >
          <FcGoogle size={20} />
          <span>Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleFacebookSignIn}
          loading={loading === 'facebook'}
          disabled={!!loading}
          className="flex items-center justify-center gap-2"
        >
          <FaFacebook size={20} className="text-blue-600" />
          <span>Facebook</span>
        </Button>
      </div>
    </div>
  );
}
