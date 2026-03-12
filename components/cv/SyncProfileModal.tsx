'use client';

import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiX, FiCheck } from 'react-icons/fi';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';

export interface FieldDifference {
  field: string;
  label: { en: string; ar: string };
  profileValue: string;
  cvValue: string;
}

interface SyncProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  differences: FieldDifference[];
  cvId?: number | string;
  onSyncComplete?: () => void;
}

export default function SyncProfileModal({
  isOpen,
  onClose,
  differences,
  cvId,
  onSyncComplete,
}: SyncProfileModalProps) {
  const { isRTL } = useLanguage();
  const { token, refreshUser } = useAuth();
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFields(new Set(differences.map(d => d.field)));
      setError(null);
    }
  }, [isOpen, differences]);

  if (!isOpen || differences.length === 0) return null;

  const toggleField = (field: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(field)) {
      newSelected.delete(field);
    } else {
      newSelected.add(field);
    }
    setSelectedFields(newSelected);
  };

  const handleSync = async () => {
    if (selectedFields.size === 0) {
      onClose();
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const updateData: Record<string, string> = {};
      
      differences.forEach(diff => {
        if (selectedFields.has(diff.field)) {
          if (diff.field === 'phone') {
            updateData.phoneNumber = diff.cvValue;
          } else {
            updateData[diff.field] = diff.cvValue;
          }
        }
      });

      await axios.put('/api/user/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshUser();
      
      if (cvId) {
        const syncedKey = `syncDismissed_${cvId}`;
        sessionStorage.setItem(syncedKey, 'true');
      }

      onSyncComplete?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to sync profile:', err);
      setError(isRTL 
        ? 'فشل في تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.'
        : 'Failed to update profile. Please try again.'
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleSkip = () => {
    if (cvId) {
      const syncedKey = `syncDismissed_${cvId}`;
      sessionStorage.setItem(syncedKey, 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FiRefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isRTL ? 'تحديث الملف الشخصي' : 'Update Profile'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isRTL 
                    ? 'بيانات سيرتك الذاتية تختلف عن ملفك الشخصي'
                    : 'Your CV data differs from your profile'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            {isRTL
              ? 'اختر البيانات التي تريد نقلها إلى ملفك الشخصي:'
              : 'Select the data you want to sync to your profile:'
            }
          </p>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {differences.map((diff) => (
              <label
                key={diff.field}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFields.has(diff.field)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={selectedFields.has(diff.field)}
                    onChange={() => toggleField(diff.field)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">
                    {isRTL ? diff.label.ar : diff.label.en}
                  </div>
                  <div className="mt-1 text-xs">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="font-medium">
                        {isRTL ? 'الحالي:' : 'Current:'}
                      </span>
                      <span className="truncate">
                        {diff.profileValue || (isRTL ? '(فارغ)' : '(empty)')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 mt-0.5">
                      <span className="font-medium">
                        {isRTL ? 'الجديد:' : 'New:'}
                      </span>
                      <span className="truncate">{diff.cvValue}</span>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={syncing}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {isRTL ? 'تخطي' : 'Skip'}
            </button>
            <button
              onClick={handleSync}
              disabled={syncing || selectedFields.size === 0}
              className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRTL ? 'جارٍ التحديث...' : 'Updating...'}
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  {isRTL ? 'تحديث الملف الشخصي' : 'Update Profile'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function detectProfileDifferences(
  cvPersonalInfo: {
    fullName?: string;
    phone?: string;
    location?: string;
    nationality?: string;
    linkedin?: string;
  },
  user: {
    fullName?: string | null;
    phoneNumber?: string;
    location?: string;
    nationality?: string;
    linkedin?: string;
  }
): FieldDifference[] {
  const differences: FieldDifference[] = [];

  const fieldMappings: Array<{
    cvField: keyof typeof cvPersonalInfo;
    userField: keyof typeof user;
    label: { en: string; ar: string };
    outputField: string;
  }> = [
    { cvField: 'phone', userField: 'phoneNumber', label: { en: 'Phone Number', ar: 'رقم الهاتف' }, outputField: 'phone' },
    { cvField: 'location', userField: 'location', label: { en: 'Location', ar: 'الموقع' }, outputField: 'location' },
    { cvField: 'nationality', userField: 'nationality', label: { en: 'Nationality', ar: 'الجنسية' }, outputField: 'nationality' },
    { cvField: 'linkedin', userField: 'linkedin', label: { en: 'LinkedIn URL', ar: 'رابط لينكدإن' }, outputField: 'linkedin' },
  ];

  for (const mapping of fieldMappings) {
    const cvValue = cvPersonalInfo[mapping.cvField]?.trim() || '';
    const profileValue = (user[mapping.userField] as string)?.trim() || '';

    if (cvValue && cvValue !== profileValue) {
      differences.push({
        field: mapping.outputField,
        label: mapping.label,
        profileValue: profileValue,
        cvValue: cvValue,
      });
    }
  }

  return differences;
}
