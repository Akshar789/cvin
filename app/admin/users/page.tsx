'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { FiSearch, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface User {
  id: number;
  email: string;
  fullName?: string;
  targetJobTitle?: string;
  subscriptionTier: string;
  onboardingCompleted: boolean;
  createdAt: string;
  cvCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [changingTier, setChangingTier] = useState<number | null>(null);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, page]);

  const fetchUsers = async (searchVal?: string) => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchVal ?? search, page },
      });
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const changeTier = async (userId: number, tier: string) => {
    try {
      setChangingTier(userId);
      await axios.patch(`/api/admin/users/${userId}`, { subscriptionTier: tier }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to change tier:', error);
    } finally {
      setChangingTier(null);
    }
  };

  const tierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      free: 'bg-gray-100 text-gray-700',
      premium: 'bg-amber-50 text-amber-700',
      admin: 'bg-red-50 text-red-700',
    };
    return styles[tier] || styles.free;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{total} total users</p>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-navy-600 text-white text-sm rounded-lg hover:bg-navy-700 transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Job Title</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">CVs</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Tier</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 hidden sm:table-cell">Joined</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{u.fullName || '-'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.targetJobTitle || '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{u.cvCount}</td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={u.subscriptionTier}
                        onChange={(e) => changeTier(u.id, e.target.value)}
                        disabled={changingTier === u.id}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${tierBadge(u.subscriptionTier)}`}
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs hidden sm:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => router.push(`/admin/users/${u.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-navy-600 hover:text-navy-800 font-medium"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
            >
              <FiChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
            >
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
