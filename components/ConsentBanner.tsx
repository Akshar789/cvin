'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import Link from 'next/link';

export default function ConsentBanner() {
  const { isRTL } = useLanguage();
  const { user, token } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user && token && !showBanner) {
      // Only check consent status on first load or if banner needs to be shown
      console.log('[ConsentBanner] User logged in, checking consent status');
      checkConsentStatus();
    }
  }, [user, token]);

  const checkConsentStatus = async () => {
    try {
      const response = await axios.get('/api/privacy/consent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const consent = response.data.consent;
      console.log('[ConsentBanner] Consent status:', consent);
      // Show banner if user hasn't accepted terms
      // Check both camelCase and snake_case field names
      const hasAccepted = consent.termsAcceptedAt || consent.terms_accepted_at;
      if (!hasAccepted) {
        console.log('[ConsentBanner] Showing banner - no terms accepted yet');
        setShowBanner(true);
      } else {
        console.log('[ConsentBanner] Banner not shown - terms already accepted at:', hasAccepted);
        setShowBanner(false);
      }
    } catch (error) {
      console.error('[ConsentBanner] Error checking consent:', error);
      // Show banner on error to be safe
      setShowBanner(true);
    }
  };

  const acceptConsent = async () => {
    if (!checked) {
      alert(isRTL ? 'يجب عليك الموافقة على الشروط أولاً' : 'Please accept the terms first');
      return;
    }
    
    setLoading(true);
    try {
      console.log('[ConsentBanner] Sending consent acceptance');
      await axios.post(
        '/api/privacy/consent',
        {
          dataProcessingConsent: true,
          aiGenerationConsent: true,
          documentStorageConsent: true,
          profileGenerationConsent: true,
          termsAcceptedAt: new Date().toISOString(),
          privacyAcceptedAt: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('[ConsentBanner] Consent saved successfully');
      setShowBanner(false);
    } catch (error) {
      console.error('[ConsentBanner] Error accepting consent:', error);
      alert(isRTL ? 'حدث خطأ - يرجى المحاولة مرة أخرى' : 'Error - please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!showBanner || !user) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl z-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-lg font-semibold mb-2">
            {isRTL 
              ? '🔒 موافقتك على شروط الاستخدام وسياسة الخصوصية'
              : '🔒 Privacy & Terms Acceptance'
            }
          </p>
          <p className="text-sm text-blue-100 leading-relaxed mb-3">
            {isRTL
              ? 'بالاستمرار، فإنك توافق على شروط الاستخدام وسياسة الخصوصية، بما في ذلك كيفية معالجة بياناتك وفقاً لنظام حماية البيانات الشخصية السعودي.'
              : 'By continuing, you agree to our Terms of Use and Privacy Policy, including how your data is processed under Saudi Arabia\'s Personal Data Protection Law.'
            }
          </p>
          <div className="flex gap-2 text-xs text-blue-100 flex-wrap mb-3">
            <Link href="/legal/terms-of-use" target="_blank" className="underline hover:text-white">
              {isRTL ? 'شروط الاستخدام' : 'Terms'}
            </Link>
            <span>•</span>
            <Link href="/legal/privacy-policy" target="_blank" className="underline hover:text-white">
              {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
            <span>•</span>
            <Link href="/legal/ai-disclosure" target="_blank" className="underline hover:text-white">
              {isRTL ? 'الإفصاح عن الذكاء الاصطناعي' : 'AI Disclosure'}
            </Link>
          </div>
          <label className="flex items-center gap-2 text-sm text-blue-100">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4 h-4"
            />
            {isRTL 
              ? 'أوافق على جميع الشروط والخصوصية'
              : 'I agree to all terms and privacy policy'
            }
          </label>
        </div>
        <button
          onClick={acceptConsent}
          disabled={loading || !checked}
          className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
        >
          {loading 
            ? (isRTL ? 'جاري...' : 'Processing...')
            : (isRTL ? 'أوافق وأستمر' : 'I Agree & Continue')
          }
        </button>
      </div>
    </div>
  );
}
