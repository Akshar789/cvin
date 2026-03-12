'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate processing the session
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center animate-pulse">
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Processing Your Payment</h1>
              <p className="text-gray-600">Please wait while we activate your subscription...</p>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-emerald-600 animate-[slideIn_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Activated!</h1>
                <p className="text-gray-600">
                  Welcome to your new subscription plan. You now have access to all premium features.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h3 className="font-bold text-green-900 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Your subscription is now active</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Check your email for confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span>Start using all premium features immediately</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link href="/dashboard">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                    Go to Dashboard
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link href="/templates">
                  <button className="w-full px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-all">
                    Explore Templates
                  </button>
                </Link>
              </div>

              {sessionId && (
                <p className="text-xs text-gray-400 text-center">Session ID: {sessionId}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
