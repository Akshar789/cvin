'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX, FiCheck, FiZap } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import axios from 'axios';
import Link from 'next/link';

interface CVUploaderProps {
  onDataExtracted: (data: any) => void;
  onClose?: () => void;
}

export default function CVUploader({ onDataExtracted, onClose }: CVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!['pdf', 'docx'].includes(fileExtension || '')) {
        setError('Please upload a PDF or DOCX file');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setRequiresUpgrade(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      formData.append('fileType', fileExtension || '');

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/ai/extract-cv-data', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setCreditsRemaining(response.data.creditsRemaining);
      
      setTimeout(() => {
        onDataExtracted(response.data.extractedData);
        if (onClose) onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to extract data from CV';
      setError(errorMessage);
      
      if (err.response?.data?.requiresUpgrade) {
        setRequiresUpgrade(true);
        setCreditsRemaining(0);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    
    if (droppedFile) {
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();
      
      if (!['pdf', 'docx'].includes(fileExtension || '')) {
        setError('Please upload a PDF or DOCX file');
        return;
      }

      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(droppedFile);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Import Existing CV</h2>
            <p className="text-gray-600 mt-1">
              Upload your CV to auto-fill the builder (PDF or DOCX)
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          )}
        </div>

        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-turquoise-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Drop your CV here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF and DOCX files up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-turquoise-100 rounded-lg">
                  <FiFile className="text-turquoise-600" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && !success && (
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>

            {success && (
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <FiCheck size={20} />
                <span className="font-semibold">Data extracted successfully!</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={uploading || success}
                fullWidth
              >
                {uploading ? 'Extracting Data...' : success ? 'Complete!' : 'Extract Data'}
              </Button>
              {!uploading && !success && (
                <Button
                  variant="outline"
                  onClick={removeFile}
                >
                  Change File
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Credits Display */}
        {creditsRemaining !== null && creditsRemaining < 999 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-turquoise-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-800">
              <FiZap className="text-purple-600" size={20} />
              <p className="text-sm font-semibold">
                {creditsRemaining > 0 
                  ? `${creditsRemaining} free AI generation${creditsRemaining !== 1 ? 's' : ''} remaining`
                  : 'No free AI generations remaining'}
              </p>
            </div>
          </div>
        )}

        {/* Upgrade Prompt */}
        {requiresUpgrade && (
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <FiZap className="text-orange-600" size={32} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-orange-900 mb-2">
              Upgrade to Continue
            </h3>
            <p className="text-orange-800 mb-4">
              You've used all 5 free AI CV generations. Upgrade to unlock unlimited AI-powered CV building.
            </p>
            <Link href="/pricing">
              <Button variant="primary" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Our AI will automatically extract your personal info, work experience, education, and skills from your CV. Review the extracted data and make any necessary adjustments.
          </p>
        </div>
      </div>
    </Card>
  );
}
