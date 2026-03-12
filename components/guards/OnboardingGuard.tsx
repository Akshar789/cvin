'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

const publicPrefixes = ['/auth', '/cv/', '/template', '/career-tips', '/about', '/contact', '/privacy', '/terms', '/pricing', '/templates'];
const exactPublicPaths = ['/', '/pricing'];
const exemptPaths = ['/onboarding', '/auth/login', '/auth/register'];

function isPublicPath(pathname: string): boolean {
  if (exactPublicPaths.includes(pathname)) return true;
  return publicPrefixes.some(prefix => pathname.startsWith(prefix));
}

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (exemptPaths.includes(pathname) || isPublicPath(pathname)) {
      return;
    }

    if (user && !user.onboardingCompleted && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}
