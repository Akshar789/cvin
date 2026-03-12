'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FiLock } from 'react-icons/fi';

export default function CareerTipsPage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchTips();
  }, [selectedCategory]);

  const fetchTips = async () => {
    try {
      const url = selectedCategory
        ? `/api/career-tips?category=${selectedCategory}`
        : '/api/career-tips';
      
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(url, config);
      setTips(response.data.tips);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(tips.map(tip => tip.category)));

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
        <h1 className="text-4xl font-bold text-navy-900 mb-4">Career Tips</h1>
        <p className="text-xl text-gray-600 mb-8">
          Expert advice to help you succeed in your job search and career
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            size="sm"
            variant={selectedCategory === null ? 'primary' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <Card key={tip.id} hover>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-navy-900">{tip.title}</h3>
                  {tip.isPremium && (
                    <FiLock className="text-turquoise-600 flex-shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{tip.category}</p>
                <p className="text-gray-700">{tip.content}</p>
              </Card>
            ))}
          </div>
        )}

        {!user && (
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <FiLock className="w-12 h-12 mx-auto text-turquoise-600 mb-4" />
              <h3 className="text-2xl font-bold text-navy-900 mb-2">
                Unlock Premium Career Tips
              </h3>
              <p className="text-gray-600 mb-6">
                Get access to exclusive career advice, interview strategies, and more
              </p>
              <Link href="/auth/register">
                <Button size="lg">{t.hero.cta}</Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
