'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import Button from './Button';
import Link from 'next/link';
import { FiX, FiStar, FiCheck } from 'react-icons/fi';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const premiumFeatures = [
    t.pricing.features.unlimited,
    t.pricing.features.advancedAI,
    t.pricing.features.coverLetters,
    t.pricing.features.idpGenerator,
    t.pricing.features.linkedinOptimizer,
    t.pricing.features.careerCoach,
    t.pricing.features.multiFormat,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-turquoise-100 rounded-lg">
                <FiStar className="w-5 h-5 text-turquoise-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {isRTL ? 'ترقية إلى النسخة المميزة' : 'Upgrade to Premium'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="mb-3 p-3 bg-gradient-to-r from-turquoise-50 to-navy-50 rounded-lg border-2 border-turquoise-200">
            <p className="text-base text-gray-800 font-medium text-center">
              {isRTL 
                ? 'لقد استخدمت جميع محاولاتك المجانية!'
                : 'You\'ve used all your free credits!'}
            </p>
            <p className="text-sm text-gray-700 text-center mt-1">
              {isRTL 
                ? 'أنت واضح في سعيك لتطوير نفسك. فعّل اشتراكك الآن واحصل على سيرة ذاتية احترافية تزيد فرصك في المقابلات.'
                : 'You\'re clearly committed to your professional growth. Activate your subscription now and get a professional CV that increases your interview chances.'}
            </p>
          </div>

          {feature && (
            <div className="mb-3 p-3 bg-orange-50 border-l-4 border-orange-400">
              <p className="text-sm text-orange-900">
                <strong>
                  {isRTL ? 'الميزة المطلوبة:' : 'Feature requested:'}{' '}
                </strong>
                {feature}
              </p>
            </div>
          )}

          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {isRTL ? 'مع الاشتراك المميز تحصل على:' : 'With Premium you get:'}
            </h3>
            <ul className="space-y-1.5">
              {premiumFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <FiCheck className="w-4 h-4 text-turquoise-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-navy-50 p-3 rounded-lg mb-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-navy-900">
                  {isRTL ? '19 ريال' : '$4.99'}
                </div>
                <div className="text-xs text-gray-600">
                  {isRTL ? 'شهرياً' : 'Monthly'}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-turquoise-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    {isRTL ? 'وفّر شهرين' : 'Save 2 Months'}
                  </span>
                </div>
                <div className="text-lg font-bold text-navy-900">
                  {isRTL ? '149 ريال' : '$39'}
                </div>
                <div className="text-xs text-gray-600">
                  {isRTL ? 'سنوياً' : 'Yearly'}
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-navy-900">
                  {isRTL ? '229 ريال' : '$59'}
                </div>
                <div className="text-xs text-gray-600">
                  {isRTL ? 'مدى الحياة' : 'Lifetime'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/pricing" className="flex-1">
              <Button variant="primary" fullWidth>
                {isRTL ? 'عرض جميع الخطط' : 'View All Plans'}
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose}>
              {isRTL ? 'ليس الآن' : 'Not Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
