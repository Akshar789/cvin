'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewPrepRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/premium/interview-prep');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-navy-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
