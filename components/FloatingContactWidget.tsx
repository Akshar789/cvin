'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiMessageCircle, FiMail, FiX, FiChevronUp } from 'react-icons/fi';

export default function FloatingContactWidget() {
  const { t, isRTL, isHydrated } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(true);

  const whatsappNumber = '+966501234567';
  const whatsappMessage = 'Hello! I would like to know more about CVin.';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
  const emailLink = 'mailto:support@cvin.com?subject=CVin Support';

  // Don't render until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <>
      {/* Floating Widget */}
      <div className={`fixed z-50 transition-all duration-300 ${isRTL ? 'left-4 md:left-6' : 'right-4 md:right-6'} bottom-6 flex flex-col gap-3 items-${isRTL ? 'start' : 'end'}`}>
        {/* Expanded Menu */}
        {isOpen && (
          <div className="mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-slide-up min-w-[280px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">{t.contact.title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="p-4 space-y-3">
              {/* WhatsApp Option */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition border border-green-200 hover:border-green-300"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t.contact.whatsappButton}</p>
                  <p className="text-xs text-gray-600">⚡ Instant support</p>
                </div>
              </a>

              {/* Email Option */}
              <a
                href={emailLink}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition border border-blue-200 hover:border-blue-300"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t.contact.emailButton}</p>
                  <p className="text-xs text-gray-600">📧 24h response</p>
                </div>
              </a>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t text-xs text-gray-600 text-center">
              <p>{isRTL ? 'نرد عادة في غضون 5-10 دقائق على WhatsApp' : 'We typically respond within 5-10 minutes on WhatsApp'}</p>
            </div>
          </div>
        )}

        {/* Main Button with Label */}
        <div className="flex flex-col gap-2 items-center">
          {/* Label */}
          {showLabel && !isOpen && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse whitespace-nowrap text-sm font-bold">
              {t.contact.title}
            </div>
          )}
          
          {/* Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white font-bold text-2xl border-4 border-white ${
              isOpen
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 animate-bounce'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
            aria-label="Contact us"
            onMouseEnter={() => setShowLabel(true)}
            onMouseLeave={() => setShowLabel(!isOpen)}
          >
            {isOpen ? (
              <FiChevronUp className="w-7 h-7" />
            ) : (
              <span className="text-2xl">💬</span>
            )}
          </button>
        </div>
      </div>

      {/* Overlay for closing */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
