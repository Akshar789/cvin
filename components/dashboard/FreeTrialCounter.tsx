'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Link from 'next/link';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface UsageStats {
  cvGenerations: number;
  textImprovements: number;
  interviewSets: number;
  cvGenerationsRemaining: number;
  textImprovementsRemaining: number;
  interviewSetsRemaining: number;
  isPremium: boolean;
}

export default function FreeTrialCounter() {
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/usage', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  if (!stats || stats.isPremium) {
    return null;
  }

  const hasUsedAllCredits = 
    stats.cvGenerationsRemaining === 0 && 
    stats.textImprovementsRemaining === 0 && 
    stats.interviewSetsRemaining === 0;

  if (hasUsedAllCredits) {
    return (
      <Card className="mb-6 border-2 border-orange-400 bg-orange-50">
        <div className="flex items-start gap-4">
          <FiAlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {isRTL ? 'لقد استخدمت جميع محاولاتك المجانية!' : 'You\'ve used all your free credits!'}
            </h3>
            <p className="text-gray-700 mb-4">
              {isRTL 
                ? 'أنت واضح في سعيك لتطوير نفسك. فعّل اشتراكك الآن واحصل على سيرة ذاتية احترافية تزيد فرصك في المقابلات.'
                : 'You\'re clearly committed to your professional growth. Activate your subscription now and get unlimited access to all premium features.'}
            </p>
            <Link href="/pricing">
              <Button variant="primary">
                {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-2 border-turquoise-400 bg-turquoise-50">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {isRTL ? 'التجربة المجانية' : 'Free Trial'}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            {isRTL ? 'إنشاءات السيرة الذاتية' : 'CV Generations'}
          </span>
          <span className="font-bold text-turquoise-600">
            {stats.cvGenerationsRemaining} / 3
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            {isRTL ? 'تحسينات النص' : 'Text Improvements'}
          </span>
          <span className="font-bold text-turquoise-600">
            {stats.textImprovementsRemaining} / 3
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            {isRTL ? 'مجموعات أسئلة المقابلة' : 'Interview Question Sets'}
          </span>
          <span className="font-bold text-turquoise-600">
            {stats.interviewSetsRemaining} / 1
          </span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-turquoise-200">
        <p className="text-sm text-gray-600 mb-3">
          {isRTL 
            ? 'احصل على استخدام غير محدود مع الاشتراك المميز'
            : 'Get unlimited usage with Premium subscription'}
        </p>
        <Link href="/pricing">
          <Button variant="outline" size="sm" fullWidth>
            {isRTL ? 'عرض الخطط' : 'View Plans'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
