'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FiBell, FiX, FiStar, FiZap } from 'react-icons/fi';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface HeaderNotificationsProps {
  user: any;
  primaryCv: any;
  cvCount: number;
}

export default function HeaderNotifications({ user, primaryCv, cvCount }: HeaderNotificationsProps) {
  const { isRTL } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    const fields = [
      'fullName', 'email', 'phone', 'location',
      'targetJobTitle', 'careerLevel', 'yearsOfExperience'
    ];
    const filled = fields.filter(field => {
      const value = (user as any)[field];
      return value && value.toString().trim() !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isFreeTier = user?.subscriptionTier === 'free';
  const hasNotifications = (profileCompletion < 100 || cvCount === 0) && !dismissed;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Upgrade Prompt - Only for free users */}
      {isFreeTier && (
        <Link 
          href="/pricing"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
        >
          <FiZap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRTL ? 'ترقية' : 'Upgrade'}</span>
        </Link>
      )}

      {/* Pro Badge - For paid users */}
      {!isFreeTier && (
        <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white rounded-full text-xs font-semibold">
          <FiStar className="w-3 h-3" />
          <span>Pro</span>
        </div>
      )}

      {/* Notification Bell - Simple & Clean */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiBell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {showNotifications && (
          <div className={`absolute top-full mt-2 ${isRTL ? 'left-0' : 'right-0'} w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50`}>
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-700">
                {isRTL ? 'الإشعارات' : 'Notifications'}
              </span>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-2">
              {cvCount === 0 && (
                <Link 
                  href="/template-gallery"
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 rounded-lg hover:bg-turquoise-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-turquoise-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">📄</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-turquoise-700">
                        {isRTL ? 'أنشئ سيرتك الذاتية' : 'Create your CV'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isRTL ? 'ابدأ الآن مع الذكاء الاصطناعي' : 'Start now with AI assistance'}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {profileCompletion < 100 && (
                <Link
                  href="/settings"
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                        {isRTL ? 'أكمل ملفك الشخصي' : 'Complete profile'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${profileCompletion}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{profileCompletion}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {isFreeTier && (
                <Link 
                  href="/pricing"
                  onClick={() => setShowNotifications(false)}
                  className="block p-3 rounded-lg hover:bg-amber-50 transition-colors group mt-1"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiZap className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700">
                        {isRTL ? 'ترقية للاحترافي' : 'Upgrade to Pro'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isRTL ? 'احصل على ميزات غير محدودة' : 'Get unlimited features'}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {!hasNotifications && !isFreeTier && (
                <div className="p-4 text-center">
                  <span className="text-2xl">✨</span>
                  <p className="text-sm text-gray-500 mt-1">
                    {isRTL ? 'أنت جاهز!' : 'You\'re all set!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
