'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { PRICING_PLANS, isProductionPricing } from '@/config/pricing';

export default function PricingPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | undefined, mode: string, planName: string, href?: string) => {
    // If it's a free plan with href, just navigate
    if (href) {
      router.push(href);
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!priceId) {
      alert('This plan is not yet configured. Please contact support.');
      return;
    }

    // Warning for test mode
    if (!isProductionPricing) {
      const confirmed = confirm(
        '⚠️ Payment System Not Configured\n\n' +
        'Stripe products are not yet set up. The checkout will fail.\n\n' +
        'See STRIPE_SETUP.md for configuration instructions.\n\n' +
        'Continue anyway? (For testing)'
      );
      if (!confirmed) return;
    }

    setLoading(planName);
    try {
      const response = await axios.post(
        '/api/stripe/create-checkout',
        { priceId, mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to create checkout session';
      alert(
        `Payment Error: ${errorMsg}\n\n` +
        'This usually means Stripe products are not configured.\n' +
        'See STRIPE_SETUP.md for setup instructions.'
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-navy-900 cursor-pointer">CVin</h1>
          </Link>
          <div className="flex gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button>{t.nav.dashboard}</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">{t.nav.login}</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>{t.nav.signup}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-navy-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
          Choose the plan that fits your needs. All plans include core features.
        </p>

        {!isProductionPricing && (
          <div className="max-w-3xl mx-auto mb-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">Payment System Not Configured</h3>
                <p className="text-sm text-yellow-800">
                  Stripe products are not yet set up. Checkout will fail until configuration is complete.
                  See <code className="bg-yellow-100 px-1 rounded">STRIPE_SETUP.md</code> for instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={plan.highlighted ? 'border-4 border-turquoise-500 relative' : ''}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-turquoise-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {plan.badge}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-navy-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-navy-900">{plan.price}</div>
                {plan.priceSAR && (
                  <div className="text-sm text-gray-500">{plan.priceSAR}</div>
                )}
                <div className="text-sm text-gray-600 mt-1">{plan.period}</div>
              </div>
              <ul className="space-y-2 mb-6 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <FiCheck className="w-4 h-4 text-turquoise-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                variant={plan.highlighted ? 'primary' : 'outline'}
                onClick={() => handleSubscribe(plan.priceId, plan.mode, plan.name, plan.href)}
                loading={loading === plan.name}
                disabled={user?.subscriptionTier === plan.tier}
              >
                {user?.subscriptionTier === plan.tier ? 'Current Plan' : (plan.tier === 'free' ? 'Sign Up Free' : 'Upgrade Now')}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Have questions? <Link href="/contact" className="text-turquoise-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
