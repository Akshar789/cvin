'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  const { isHydrated } = useLanguage();

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
