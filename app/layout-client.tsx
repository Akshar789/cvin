'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/landing/Footer';
import ConsentBanner from '@/components/ConsentBanner';
import FloatingContactWidget from '@/components/FloatingContactWidget';
import OnboardingGuard from '@/components/guards/OnboardingGuard';
import HydrationGuard from '@/components/guards/HydrationGuard';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isCvBuilder = pathname?.startsWith('/cv/builder') || pathname?.startsWith('/cv/edit');

  if (isAdmin) {
    return (
      <HydrationGuard>
        {children}
      </HydrationGuard>
    );
  }

  return (
    <HydrationGuard>
      <OnboardingGuard>
        <div className="flex flex-col min-h-screen">
          {!isCvBuilder && <Navigation />}
          <main className={`flex-1 ${isCvBuilder ? '' : 'pt-16'}`}>
            {children}
          </main>
          {!isCvBuilder && <Footer />}
        </div>
        <FloatingContactWidget />
        <ConsentBanner />
      </OnboardingGuard>
    </HydrationGuard>
  );
}
