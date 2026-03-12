'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function UserSettingsPage() {
  const router = useRouter();
  const { loading } = useAuth();

  useEffect(() => {
    // Redirect to the unified profile & settings page
    router.push('/settings');
  }, [router]);

  return null;
}
