'use client';

import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiTrash2, FiCheck, FiUpload, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  token: string | null;
  isRTL?: boolean;
  onPhotoChange?: (photoUrl: string | null) => void;
  disabled?: boolean;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  token,
  isRTL = false,
  onPhotoChange,
  disabled = false,
}: ProfilePhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotoUrl(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError(isRTL 
        ? 'نوع الملف غير صالح. يرجى تحميل صور JPG أو PNG فقط.'
        : 'Invalid file type. Please upload JPG or PNG images only.'
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(isRTL
        ? 'الملف كبير جدًا. الحد الأقصى للحجم هو 5 ميجابايت.'
        : 'File too large. Maximum size is 5MB.'
      );
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post('/api/profile/photo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.photoURL) {
        setPhotoUrl(response.data.photoURL);
        onPhotoChange?.(response.data.photoURL);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setError(err.response?.data?.error || (isRTL ? 'فشل تحميل الصورة' : 'Failed to upload photo'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!token) return;

    const confirmMsg = isRTL 
      ? 'هل أنت متأكد أنك تريد إزالة صورتك الشخصية؟'
      : 'Are you sure you want to remove your profile photo?';
    
    if (!confirm(confirmMsg)) return;

    setIsUploading(true);
    setError(null);

    try {
      await axios.delete('/api/profile/photo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPhotoUrl(null);
      onPhotoChange?.(null);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err: any) {
      console.error('Photo delete error:', err);
      setError(err.response?.data?.error || (isRTL ? 'فشل إزالة الصورة' : 'Failed to remove photo'));
    } finally {
      setIsUploading(false);
    }
  };

  const texts = {
    title: isRTL ? 'الصورة الشخصية' : 'Profile Photo',
    uploadBtn: isRTL ? 'تحميل صورة' : 'Upload Photo',
    changeBtn: isRTL ? 'تغيير الصورة' : 'Change Photo',
    removeBtn: isRTL ? 'إزالة الصورة' : 'Remove Photo',
    saved: isRTL ? 'تم الحفظ ✓' : 'Saved ✓',
    uploading: isRTL ? 'جاري التحميل...' : 'Uploading...',
    guidelines: {
      title: isRTL ? 'إرشادات الصورة الاحترافية:' : 'Professional Photo Guidelines:',
      items: isRTL ? [
        'استخدم صورة واضحة بإنارة جيدة',
        'ارتدِ ملابس مهنية أو رسمية',
        'تجنب الخلفيات المشتتة',
        'ابتسم أو اجعل المظهر احترافيًا',
        'استخدم صورة عالية الجودة',
      ] : [
        'Use a clear headshot with proper lighting',
        'Wear business or business-casual attire',
        'Avoid distracting backgrounds',
        'Look confident and approachable',
        'Use a high-resolution image',
      ],
    },
    recommended: isRTL ? 'الأبعاد الموصى بها: مربع 1:1' : 'Recommended: Square 1:1 aspect ratio',
    maxSize: isRTL ? 'الحد الأقصى: 5 ميجابايت' : 'Maximum size: 5MB',
    formats: isRTL ? 'الصيغ المقبولة: JPG, PNG' : 'Accepted formats: JPG, PNG',
  };

  return (
    <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-4">
        <FiCamera className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{texts.title}</h3>
        {showSaved && (
          <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <FiCheck className="w-4 h-4" />
            {texts.saved}
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className={`w-32 h-32 rounded-xl overflow-hidden border-2 ${photoUrl ? 'border-blue-200' : 'border-dashed border-gray-300'} bg-gray-50 flex items-center justify-center`}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <FiCamera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <span className="text-xs text-gray-400">{isRTL ? 'لا توجد صورة' : 'No photo'}</span>
                </div>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <FiUpload className="w-4 h-4" />
              {isUploading ? texts.uploading : (photoUrl ? texts.changeBtn : texts.uploadBtn)}
            </button>

            {photoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={disabled || isUploading}
                className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <FiTrash2 className="w-4 h-4" />
                {texts.removeBtn}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3">{texts.guidelines.title}</h4>
          <ul className="space-y-2">
            {texts.guidelines.items.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
            <p className="text-xs text-gray-500">{texts.recommended}</p>
            <p className="text-xs text-gray-500">{texts.maxSize}</p>
            <p className="text-xs text-gray-500">{texts.formats}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
