'use client';

import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface Variation {
  title: string;
  text: string;
}

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (text: string) => void;
  originalContent: string;
  variations: Variation[];
  loading: boolean;
  error: string | null;
  isArabic: boolean;
  fieldLabel?: string;
}

export default function RegenerateModal({
  isOpen,
  onClose,
  onSelect,
  originalContent,
  variations,
  loading,
  error,
  isArabic,
  fieldLabel,
}: RegenerateModalProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const dir = isArabic ? 'rtl' : 'ltr';

  const handleSelect = (text: string) => {
    onSelect(text);
    setSelectedIdx(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isArabic ? 'إعادة كتابة بالذكاء الاصطناعي' : 'AI Regenerate Content'}
              </h2>
              {fieldLabel && (
                <p className="text-white/80 text-xs">{fieldLabel}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              {isArabic ? 'المحتوى الحالي' : 'Current Content'}
            </label>
            <div
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 max-h-28 overflow-y-auto leading-relaxed"
              dir={dir}
            >
              {originalContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || (
                <span className="italic text-gray-400">
                  {isArabic ? 'لا يوجد محتوى' : 'No content'}
                </span>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-xl">✨</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {isArabic ? 'الذكاء الاصطناعي يعمل على إنشاء نسخ محسّنة...' : 'AI is generating improved versions...'}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && variations.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
                {isArabic ? 'الخيارات المقترحة' : 'Generated Options'}
              </label>
              {variations.map((variation, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md ${
                    selectedIdx === idx
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-indigo-700">{variation.title}</h4>
                    {selectedIdx === idx && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {isArabic ? 'محدد' : 'Selected'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line" dir={dir}>
                    {variation.text}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(variation.text);
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiCheck className="w-4 h-4" />
                    {isArabic ? 'استخدام هذا الإصدار' : 'Use This Version'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
