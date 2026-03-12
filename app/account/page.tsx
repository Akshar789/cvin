'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();

  useEffect(() => {
    // Redirect to the unified profile & settings page
    router.push('/settings');
  }, [router]);

  return null;
}
