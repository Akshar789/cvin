'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors shadow-sm"
      title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <FiGlobe className="w-5 h-5 text-gray-700" />
      <span className="font-semibold text-gray-800">{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}
