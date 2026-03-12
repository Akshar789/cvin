'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified profile & settings page
    router.push('/settings');
  }, [router]);

  return null;
}
