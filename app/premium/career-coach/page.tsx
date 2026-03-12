'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FiSend, FiLock, FiUser, FiTarget, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function CareerCoachPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { getUserCareerProfile, primaryCv } = useCvData();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [careerProfile, setCareerProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const profile = getUserCareerProfile();
      setCareerProfile(profile);
    }
  }, [user, getUserCareerProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!user || user.subscriptionTier === 'free') {
      alert('This feature requires a premium subscription');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/ai/career-coach',
        {
          message: input,
          conversationHistory: messages.slice(-10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
      };
      setMessages([...messages, userMessage, assistantMessage]);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to get response');
      setMessages([...messages, userMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiUser className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900">AI Career Coach</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!isPremium ? (
          <Card className="text-center py-12">
            <FiLock className="w-16 h-16 mx-auto text-turquoise-600 mb-4" />
            <h2 className="text-3xl font-bold text-navy-900 mb-4">Premium Feature</h2>
            <p className="text-xl text-gray-600 mb-8">
              Get personalized career advice from our AI Career Coach
            </p>
            <Link href="/pricing">
              <Button size="lg">Upgrade to Premium</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Career Profile Indicator */}
            {careerProfile && (
              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-navy-900 mb-2">
                      Personalized coaching for {careerProfile.name}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {careerProfile.currentRole && (
                        <div>
                          <span className="text-gray-600">Current Role:</span>
                          <p className="font-medium text-navy-900">{careerProfile.currentRole}</p>
                        </div>
                      )}
                      {careerProfile.targetRole && (
                        <div>
                          <span className="text-gray-600">Target Role:</span>
                          <p className="font-medium text-navy-900">{careerProfile.targetRole}</p>
                        </div>
                      )}
                      {careerProfile.industry && (
                        <div>
                          <span className="text-gray-600">Industry:</span>
                          <p className="font-medium text-navy-900">{careerProfile.industry}</p>
                        </div>
                      )}
                    </div>
                    {careerProfile.topSkills.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Top Skills: </span>
                        <span className="text-navy-900">{careerProfile.topSkills.slice(0, 5).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <Card className="h-[calc(100vh-320px)] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <FiBriefcase className="w-16 h-16 mx-auto text-orange-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Welcome to your AI Career Coach{careerProfile?.name ? `, ${careerProfile.name.split(' ')[0]}` : ''}!
                    </h3>
                    <p className="mb-4">Ask me anything about CVs, job searches, interviews, or career development.</p>
                    {careerProfile && (
                      <div className="mt-6 text-left max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Suggested questions:</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {careerProfile.currentRole && (
                            <li>• How can I grow from {careerProfile.currentRole}?</li>
                          )}
                          {careerProfile.targetRole && (
                            <li>• What skills do I need for a {careerProfile.targetRole} role?</li>
                          )}
                          <li>• How can I improve my CV?</li>
                          <li>• Tips for my next interview?</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-turquoise-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask your career question..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  <FiSend />
                </Button>
              </div>
            </div>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
