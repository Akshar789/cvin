'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { FiPlus, FiEdit2, FiX, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

type LookupTable = 'job_domains' | 'career_levels' | 'saudi_cities';

const TABS: { key: LookupTable; label: string }[] = [
  { key: 'job_domains', label: 'Job Domains' },
  { key: 'career_levels', label: 'Career Levels' },
  { key: 'saudi_cities', label: 'Saudi Cities' },
];

export default function AdminLookupsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<LookupTable>('job_domains');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) fetchItems();
  }, [token, activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/lookups', {
        headers: { Authorization: `Bearer ${token}` },
        params: { table: activeTab },
      });
      setItems(data.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    const base: any = { nameEn: '', nameAr: '', sortOrder: 0 };
    if (activeTab !== 'saudi_cities') base.slug = '';
    if (activeTab === 'saudi_cities') base.region = '';
    setEditItem(base);
    setIsNew(true);
  };

  const openEdit = (item: any) => {
    setEditItem({ ...item });
    setIsNew(false);
  };

  const saveItem = async () => {
    if (!editItem?.nameEn || !editItem?.nameAr) return;
    try {
      setSaving(true);
      if (isNew) {
        await axios.post('/api/admin/lookups', { table: activeTab, ...editItem }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.patch('/api/admin/lookups', { table: activeTab, ...editItem }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEditItem(null);
      fetchItems();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: any) => {
    try {
      await axios.patch('/api/admin/lookups', {
        table: activeTab,
        id: item.id,
        isActive: !item.isActive,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === tab.key ? 'bg-white text-navy-800 font-medium shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#E57D30] text-white text-sm rounded-lg hover:bg-[#d06a20] transition-colors">
          <FiPlus className="w-4 h-4" /> Add New
        </button>
      </div>

      {editItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-navy-800">{isNew ? 'Add New Item' : 'Edit Item'}</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {activeTab !== 'saudi_cities' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={editItem.slug || ''}
                    onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g., information-technology"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                <input
                  type="text"
                  value={editItem.nameEn || ''}
                  onChange={(e) => setEditItem({ ...editItem, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Arabic)</label>
                <input
                  type="text"
                  value={editItem.nameAr || ''}
                  onChange={(e) => setEditItem({ ...editItem, nameAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  dir="rtl"
                />
              </div>
              {activeTab === 'saudi_cities' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={editItem.region || ''}
                    onChange={(e) => setEditItem({ ...editItem, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={editItem.sortOrder || 0}
                  onChange={(e) => setEditItem({ ...editItem, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={saveItem} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white text-sm rounded-lg hover:bg-navy-700 disabled:opacity-40">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">English</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Arabic</th>
                  {activeTab !== 'saudi_cities' && <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden sm:table-cell">Slug</th>}
                  {activeTab === 'saudi_cities' && <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden sm:table-cell">Region</th>}
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Order</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Active</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-800">{item.nameEn}</td>
                    <td className="px-4 py-3 text-gray-800" dir="rtl">{item.nameAr}</td>
                    {activeTab !== 'saudi_cities' && <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{item.slug}</td>}
                    {activeTab === 'saudi_cities' && <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.region || '-'}</td>}
                    <td className="px-4 py-3 text-center text-gray-500">{item.sortOrder}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(item)} className="text-lg">
                        {item.isActive
                          ? <FiToggleRight className="w-6 h-6 text-green-500" />
                          : <FiToggleLeft className="w-6 h-6 text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-navy-600 rounded-lg hover:bg-gray-50">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No items found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
