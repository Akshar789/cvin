'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiX, FiZap, FiCheck } from 'react-icons/fi';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  currentTier?: 'free' | 'monthly' | 'monthly_plus';
}

export default function UpgradeModal({ isOpen, onClose, feature, currentTier = 'free' }: UpgradeModalProps) {
  const { isRTL } = useLanguage();

  if (!isOpen) return null;

  const featureText = feature || (isRTL ? 'المزيد من القوة' : 'more power');
  const isFree = currentTier === 'free';
  const isMonthly = currentTier === 'monthly';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <FiZap className="w-8 h-8" />
            <h2 className="text-3xl font-bold">
              {isRTL ? 'ارتقِ بسيرتك الذاتية' : 'Unlock Your Full Potential'}
            </h2>
          </div>
          <p className="text-blue-100">
            {isRTL 
              ? `للحصول على ${featureText} وميزات أخرى، قم بالترقية إلى خطة مدفوعة`
              : `Get ${featureText} and unlock all premium features`
            }
          </p>
        </div>

        {/* Plans */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div className={`border-2 ${isFree ? 'border-blue-500 shadow-lg' : 'border-gray-200'} rounded-xl p-6 relative`}>
            {isFree && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isRTL ? 'الشهرية' : 'Monthly'}
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-blue-600">$20</span>
                <span className="text-gray-600">/{isRTL ? 'شهر' : 'month'}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                isRTL ? 'إنشاء سير ذاتية غير محدود بالذكاء الاصطناعي' : 'Unlimited AI CV generation',
                isRTL ? 'تحسين كامل لجميع الحقول بالذكاء الاصطناعي' : 'Full AI enhancement on all fields',
                isRTL ? 'توليد 5 مسؤوليات لكل وظيفة' : '5 responsibilities per job',
                isRTL ? 'توليد مهارات متقدمة (8-15 مهارة)' : 'Advanced skills generation (8-15 skills)',
                isRTL ? 'جميع القوالب مفتوحة' : 'All templates unlocked',
                isRTL ? 'تصدير PDF عالي الجودة (بدون علامة مائية)' : 'High-quality PDF export (no watermark)',
                isRTL ? 'معالجة ذات أولوية' : 'Priority processing speed',
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                // TODO: Implement subscription flow
                window.location.href = '/pricing';
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isRTL ? 'ابدأ الآن' : 'Get Started'}
            </button>
          </div>

          {/* Monthly Plus Plan */}
          <div className={`border-2 ${isMonthly ? 'border-purple-500 shadow-lg' : 'border-gray-200'} rounded-xl p-6 relative bg-gradient-to-br from-purple-50 to-blue-50`}>
            {isMonthly && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {isRTL ? 'موصى به' : 'Recommended'}
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isRTL ? 'الشهرية بلس' : 'Monthly Plus'}
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-purple-600">$35</span>
                <span className="text-gray-600">/{isRTL ? 'شهر' : 'month'}</span>
              </div>
              <p className="text-sm text-purple-600 mt-2 font-semibold">
                {isRTL ? 'جميع ميزات الشهرية +' : 'Everything in Monthly +'}
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                isRTL ? 'الوصول المبكر للقوالب الجديدة' : 'Early access to new templates',
                isRTL ? 'أوضاع إعادة كتابة ذكية بالذكاء الاصطناعي' : 'Smart AI rewriting modes',
                isRTL ? '  - وضع تعزيز ATS' : '  - ATS Boost mode',
                isRTL ? '  - وضع النبرة المهنية' : '  - Professional Tone mode',
                isRTL ? '  - إعادة كتابة تنفيذية' : '  - Executive Rewrite mode',
                isRTL ? 'تصدير متعدد الصيغ' : 'Multi-format export',
                isRTL ? '  - PDF، DOCX، نص لينكدإن' : '  - PDF, DOCX, LinkedIn-Ready',
                isRTL ? 'قسم "إنجازات مهنية" مولد بالذكاء الاصطناعي' : 'AI-generated Career Achievements section',
                isRTL ? 'دعم عملاء ذو أولوية' : 'Priority customer support',
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <FiCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                // TODO: Implement subscription flow
                window.location.href = '/pricing';
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isRTL ? 'ترقية إلى بلس' : 'Upgrade to Plus'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-2xl text-center">
          <p className="text-sm text-gray-600">
            {isRTL 
              ? 'يمكنك الإلغاء في أي وقت. لا توجد رسوم خفية.'
              : 'Cancel anytime. No hidden fees.'}
          </p>
        </div>
      </div>
    </div>
  );
}
