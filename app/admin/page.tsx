'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { FiUsers, FiFileText, FiStar, FiUserPlus, FiTrendingUp, FiBookOpen } from 'react-icons/fi';

interface Stats {
  totalUsers: number;
  totalCVs: number;
  premiumUsers: number;
  freeUsers: number;
  guestCvs: number;
  guestUsers: number;
  totalTips: number;
  newUsers7d: number;
  newCvs7d: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [templateStats, setTemplateStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
      setTemplateStats(data.templateStats || []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'bg-blue-500', change: `+${stats.newUsers7d} this week` },
    { label: 'Total CVs', value: stats.totalCVs, icon: FiFileText, color: 'bg-green-500', change: `+${stats.newCvs7d} this week` },
    { label: 'Premium Users', value: stats.premiumUsers, icon: FiStar, color: 'bg-amber-500', change: `${stats.totalUsers ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% of total` },
    { label: 'Guest CVs', value: stats.guestCvs, icon: FiUserPlus, color: 'bg-purple-500', change: `${stats.guestUsers} guests` },
    { label: 'Free Users', value: stats.freeUsers, icon: FiUsers, color: 'bg-gray-500', change: `${stats.totalUsers ? Math.round((stats.freeUsers / stats.totalUsers) * 100) : 0}% of total` },
    { label: 'Career Tips', value: stats.totalTips, icon: FiBookOpen, color: 'bg-teal-500', change: 'Published articles' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-navy-800 mt-1">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-navy-800">Recent Users</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.slice(0, 8).map((u: any) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-600 flex-shrink-0">
                    {(u.fullName || u.email)?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.fullName || u.email}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${u.subscriptionTier === 'premium' ? 'bg-amber-50 text-amber-700' : u.subscriptionTier === 'admin' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.subscriptionTier}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-navy-800">Template Usage</h3>
          </div>
          <div className="p-5 space-y-3">
            {templateStats.length === 0 ? (
              <p className="text-sm text-gray-400">No template data yet</p>
            ) : (
              templateStats.map((t: any) => {
                const maxCount = Math.max(...templateStats.map((x: any) => parseInt(x.count)));
                const pct = maxCount > 0 ? (parseInt(t.count) / maxCount) * 100 : 0;
                return (
                  <div key={t.templateId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{t.templateId || 'Unknown'}</span>
                      <span className="text-gray-500">{t.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-[#E57D30] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
