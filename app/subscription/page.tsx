'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { PRICING_PLANS, getPlanByTier } from '@/config/pricing';
import { FiCheck, FiArrowRight, FiLoader } from 'react-icons/fi';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleUpgrade = async (priceId: string, tier: string) => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }

    try {
      setCheckingOut(tier);
      setError('');
      
      const response = await axios.post(
        '/api/stripe/create-checkout',
        { 
          priceId, 
          mode: 'subscription'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to create checkout session');
      setCheckingOut(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const currentPlan = getPlanByTier(user.subscriptionTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
          <p className="text-xl text-gray-600">
            Current Plan: <span className="font-bold text-indigo-600">{currentPlan?.name || 'Free Trial'}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = user.subscriptionTier === plan.tier;
            const isPaidPlan = plan.tier !== 'free';

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border-2 transition-all duration-300 ${
                  isCurrentPlan
                    ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                } ${plan.highlighted ? 'lg:ring-2 lg:ring-indigo-400 lg:scale-105' : ''}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-t-lg text-center">
                    {plan.badge}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{plan.priceSAR}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <FiCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  {isCurrentPlan ? (
                    <div className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-center font-semibold">
                      Current Plan
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        if (isPaidPlan && plan.priceId) {
                          handleUpgrade(plan.priceId, plan.tier);
                        } else {
                          router.push(plan.href || '/auth/register');
                        }
                      }}
                      disabled={checkingOut === plan.tier}
                      className="w-full"
                    >
                      {checkingOut === plan.tier ? (
                        <div className="flex items-center justify-center gap-2">
                          <FiLoader className="animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {isPaidPlan ? 'Upgrade Now' : 'Start Free'}
                          <FiArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. There are no long-term contracts.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee if you're not satisfied with your subscription.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-600">Yes, you can change your plan anytime. Changes take effect at the start of your next billing cycle.</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, debit cards, and digital payment methods through Stripe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
