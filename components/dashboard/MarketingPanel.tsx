'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiStar, FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function MarketingPanel() {
  const { t, isRTL } = useLanguage();

  return (
    <Card className="sticky top-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20"></div>
      
      <div className="relative">
        {/* CV Preview Header */}
        <div className="h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">Premium CV</div>
            <div className="text-xs text-purple-100">Professional Design</div>
          </div>
        </div>

        {/* Unlock Message */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <FiStar className="w-4 h-4 text-yellow-400" />
            <h3 className="font-bold text-base text-navy-900">{t.dashboard.unlockPro}</h3>
          </div>
          <p className="text-gray-600 text-xs">
            {t.dashboard.unlockProDesc}
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-700">Color themes & layouts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-700">Photo upload & positioning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-700">AI content rewriting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-700">20+ premium templates</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href="/pricing">
          <Button 
            fullWidth 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-2 text-sm"
          >
            {t.dashboard.upgradeToPro}
            <FiArrowRight className={`w-3 h-3 ${isRTL ? 'mr-1' : 'ml-1'}`} />
          </Button>
        </Link>

        {/* Discount Badge */}
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-xs text-green-700 font-semibold">Save 58% with Annual Plan</p>
        </div>
      </div>
    </Card>
  );
}
