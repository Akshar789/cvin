'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function AdminCvsPage() {
  const { token } = useAuth();
  const [cvs, setCvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (token) fetchCvs();
  }, [token, page]);

  const fetchCvs = async (searchVal?: string) => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/cvs', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchVal ?? search, page },
      });
      setCvs(data.cvs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCvs();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{total} total CVs</p>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, email, or name..."
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 hidden sm:table-cell">Template</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 hidden sm:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cvs.map((cv) => (
                  <tr key={cv.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500">#{cv.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{cv.title || 'Untitled'}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{cv.userFullName || '-'}</p>
                      <p className="text-xs text-gray-400">{cv.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 hidden sm:table-cell">{cv.templateId || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cv.isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {cv.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs hidden sm:table-cell">
                      {new Date(cv.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {cvs.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No CVs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">
              <FiChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
