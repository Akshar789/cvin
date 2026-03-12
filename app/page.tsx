import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import TemplatesShowcase from '@/components/home/TemplatesShowcase';
import AISection from '@/components/landing/AISection';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CareerToolsSection from '@/components/CareerToolsSection';

export default function Home() {
  return (
    <>
      <Hero />
      <CareerToolsSection />
      <HowItWorks />
      <TemplatesShowcase />
      <AISection />
      <WhyChooseUs />
      <Pricing />
      <Testimonials />
    </>
  );
}
