'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiMessageCircle, FiMail } from 'react-icons/fi';

export default function Contact() {
  const { t, isRTL } = useLanguage();

  const whatsappNumber = '+966501234567';
  const whatsappMessage = 'Hello! I would like to know more about CVin.';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
  const emailLink = 'mailto:support@cvin.com?subject=CVin Support';

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            {t.contact.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.contact.description}
          </p>
        </div>

        <div className={`grid md:grid-cols-2 gap-8 max-w-3xl mx-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* WhatsApp Card */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <FiMessageCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-navy-900 mb-3">
                {t.contact.whatsappButton}
              </h3>
              
              <p className="text-gray-600 mb-4">
                Get instant support on WhatsApp. Chat with our team in real-time for quick answers to your questions.
              </p>
              
              <div className="inline-block px-4 py-2 bg-green-50 rounded-lg">
                <span className="text-sm font-semibold text-green-700">
                  {t.contact.phoneLabel}
                </span>
              </div>
            </div>
          </a>

          {/* Email Card */}
          <a
            href={emailLink}
            className="group"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full cursor-pointer">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <FiMail className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-navy-900 mb-3">
                {t.contact.emailButton}
              </h3>
              
              <p className="text-gray-600 mb-4">
                Prefer email? Send us your inquiry and we'll respond within 24 hours with detailed information.
              </p>
              
              <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">
                  {t.contact.emailLabel}
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Quick Help Section */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Quick Responses</h3>
          <p className="text-lg opacity-90 mb-6">
            Average response time: 5-10 minutes on WhatsApp • 24 hours via email
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-white/20 px-4 py-2 rounded-full">✓ Free consultation</div>
            <div className="bg-white/20 px-4 py-2 rounded-full">✓ No credit card needed</div>
            <div className="bg-white/20 px-4 py-2 rounded-full">✓ Expert support team</div>
          </div>
        </div>
      </div>
    </section>
  );
}
