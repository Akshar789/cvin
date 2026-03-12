'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

interface CareerTip {
  id: number;
  title: string;
  content: string;
  category: string;
  language: string;
  isPremium: boolean;
  createdAt: string;
}

const CATEGORIES = ['Resume Tips', 'Interview Prep', 'Career Growth', 'Job Search', 'Networking', 'Skills Development'];

export default function AdminContentPage() {
  const { token } = useAuth();
  const [tips, setTips] = useState<CareerTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTip, setEditingTip] = useState<Partial<CareerTip> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    if (token) fetchTips();
  }, [token]);

  const fetchTips = async () => {
    try {
      const { data } = await axios.get('/api/admin/career-tips', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTips(data.tips);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingTip({ title: '', content: '', category: CATEGORIES[0], language: 'en', isPremium: false });
    setIsNew(true);
  };

  const openEdit = (tip: CareerTip) => {
    setEditingTip({ ...tip });
    setIsNew(false);
  };

  const saveTip = async () => {
    if (!editingTip?.title || !editingTip?.content) return;
    try {
      setSaving(true);
      if (isNew) {
        await axios.post('/api/admin/career-tips', editingTip, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.patch(`/api/admin/career-tips/${editingTip.id}`, editingTip, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEditingTip(null);
      fetchTips();
    } catch (error) {
      console.error('Failed to save tip:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteTip = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career tip?')) return;
    try {
      await axios.delete(`/api/admin/career-tips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTips();
    } catch (error) {
      console.error('Failed to delete tip:', error);
    }
  };

  const filteredTips = filterCategory ? tips.filter((t) => t.category === filterCategory) : tips;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{tips.length} career tips</p>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#E57D30] text-white text-sm rounded-lg hover:bg-[#d06a20] transition-colors">
          <FiPlus className="w-4 h-4" /> Add Career Tip
        </button>
      </div>

      {editingTip && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-navy-800">{isNew ? 'New Career Tip' : 'Edit Career Tip'}</h3>
              <button onClick={() => setEditingTip(null)} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingTip.title || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editingTip.content || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingTip.category || ''}
                    onChange={(e) => setEditingTip({ ...editingTip, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={editingTip.language || 'en'}
                    onChange={(e) => setEditingTip({ ...editingTip, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingTip.isPremium || false}
                  onChange={(e) => setEditingTip({ ...editingTip, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                Premium only
              </label>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setEditingTip(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={saveTip} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white text-sm rounded-lg hover:bg-navy-700 disabled:opacity-40">
                <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredTips.map((tip) => (
              <div key={tip.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800 text-sm">{tip.title}</h4>
                    {tip.isPremium && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium">Premium</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-1">{tip.content}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded">{tip.category}</span>
                    <span>{tip.language === 'ar' ? 'Arabic' : 'English'}</span>
                    <span>{new Date(tip.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(tip)} className="p-2 text-gray-400 hover:text-navy-600 rounded-lg hover:bg-gray-50">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTip(tip.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredTips.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No career tips found. Click "Add Career Tip" to create one.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
