'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { FiArrowLeft, FiFileText, FiMail, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [cvs, setCvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tier, setTier] = useState('');

  useEffect(() => {
    if (token && params.id) fetchUser();
  }, [token, params.id]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`/api/admin/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(data.user);
      setCvs(data.cvs || []);
      setTier(data.user.subscriptionTier);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTier = async () => {
    try {
      setSaving(true);
      await axios.patch(`/api/admin/users/${params.id}`, { subscriptionTier: tier }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData({ ...userData, subscriptionTier: tier });
    } catch (error) {
      console.error('Failed to update tier:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return <div className="text-center py-12 text-gray-500">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-800">
        <FiArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center text-lg font-bold text-navy-600">
                {(userData.fullName || userData.email)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-navy-800">{userData.fullName || 'No Name'}</h2>
                <p className="text-xs text-gray-400">ID: {userData.id}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600"><FiMail className="w-4 h-4 text-gray-400" /> {userData.email}</div>
              {userData.phoneNumber && <div className="flex items-center gap-2 text-gray-600"><FiPhone className="w-4 h-4 text-gray-400" /> {userData.phoneNumber}</div>}
              {userData.location && <div className="flex items-center gap-2 text-gray-600"><FiMapPin className="w-4 h-4 text-gray-400" /> {userData.location}</div>}
              {userData.targetJobTitle && <div className="flex items-center gap-2 text-gray-600"><FiBriefcase className="w-4 h-4 text-gray-400" /> {userData.targetJobTitle}</div>}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Joined: {new Date(userData.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-navy-800 mb-3">Subscription Tier</h3>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3"
            >
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={saveTier}
              disabled={saving || tier === userData.subscriptionTier}
              className="w-full px-4 py-2 bg-navy-600 text-white text-sm rounded-lg hover:bg-navy-700 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : 'Update Tier'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-navy-800">User's CVs ({cvs.length})</h3>
            </div>
            {cvs.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No CVs created yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {cvs.map((cv: any) => (
                  <div key={cv.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{cv.title || `CV #${cv.id}`}</p>
                      <p className="text-xs text-gray-400">Template: {cv.templateId || 'Default'} | Updated: {new Date(cv.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cv.isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cv.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
