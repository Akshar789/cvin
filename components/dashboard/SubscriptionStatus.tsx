'use client';

import Link from 'next/link';
import { getPlanByTier } from '@/config/pricing';
import { FiSettings, FiArrowRight } from 'react-icons/fi';

interface SubscriptionStatusProps {
  tier: string;
}

export default function SubscriptionStatus({ tier }: SubscriptionStatusProps) {
  const plan = getPlanByTier(tier);

  if (!plan) return null;

  const isFree = tier === 'free';
  const isPremium = tier === 'plus' || tier === 'annual';

  return (
    <div className={`rounded-lg p-6 mb-8 ${
      isPremium 
        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200'
        : 'bg-gray-100 border-2 border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {plan.name} Plan
          </h2>
          <p className="text-gray-600">
            {isFree 
              ? '3 CVs, 3 AI improvements, limited features' 
              : isPremium
              ? 'All features, priority support, advanced AI'
              : 'Unlimited CVs, standard AI, all templates'}
          </p>
        </div>

        <Link href="/subscription">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all">
            <FiSettings className="w-4 h-4" />
            Manage
          </button>
        </Link>
      </div>

      {isFree && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-bold">Upgrade to unlock:</span> Unlimited CVs, advanced AI features, premium templates, career coaching, and more.
          </p>
        </div>
      )}
    </div>
  );
}
