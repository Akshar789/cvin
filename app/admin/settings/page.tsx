'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { FiPlus, FiSave, FiX, FiSettings } from 'react-icons/fi';

interface Setting {
  id: number;
  key: string;
  value: any;
  category: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSetting, setEditSetting] = useState<{ key: string; value: string; category: string } | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/admin/system-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditSetting({ key: '', value: '', category: 'general' });
    setIsNew(true);
  };

  const openEdit = (s: Setting) => {
    setEditSetting({
      key: s.key,
      value: typeof s.value === 'string' ? s.value : JSON.stringify(s.value, null, 2),
      category: s.category || 'general',
    });
    setIsNew(false);
  };

  const saveSetting = async () => {
    if (!editSetting?.key) return;
    try {
      setSaving(true);
      let parsedValue: any = editSetting.value;
      try { parsedValue = JSON.parse(editSetting.value); } catch {}

      await axios.post('/api/admin/system-settings', {
        key: editSetting.key,
        value: parsedValue,
        category: editSetting.category,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditSetting(null);
      fetchSettings();
    } catch (error) {
      console.error('Failed to save setting:', error);
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    const cat = s.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{settings.length} settings</p>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#E57D30] text-white text-sm rounded-lg hover:bg-[#d06a20] transition-colors">
          <FiPlus className="w-4 h-4" /> Add Setting
        </button>
      </div>

      {editSetting && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-navy-800">{isNew ? 'New Setting' : 'Edit Setting'}</h3>
              <button onClick={() => setEditSetting(null)} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <input
                  type="text"
                  value={editSetting.key}
                  onChange={(e) => setEditSetting({ ...editSetting, key: e.target.value })}
                  disabled={!isNew}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
                  placeholder="e.g., maintenance_mode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value (JSON or plain text)</label>
                <textarea
                  value={editSetting.value}
                  onChange={(e) => setEditSetting({ ...editSetting, value: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editSetting.category}
                  onChange={(e) => setEditSetting({ ...editSetting, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="e.g., general, features, limits"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setEditSetting(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={saveSetting} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white text-sm rounded-lg hover:bg-navy-700 disabled:opacity-40">
                <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : settings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <FiSettings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No system settings configured yet.</p>
          <p className="text-gray-400 text-xs mt-1">Click "Add Setting" to create your first setting.</p>
        </div>
      ) : (
        Object.entries(groupedSettings).map(([category, catSettings]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 capitalize">{category}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {catSettings.map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50 cursor-pointer" onClick={() => openEdit(s)}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 font-mono">{s.key}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {typeof s.value === 'string' ? s.value : JSON.stringify(s.value)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
