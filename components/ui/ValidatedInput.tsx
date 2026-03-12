'use client';

import { FiAlertCircle } from 'react-icons/fi';

interface ValidatedInputProps {
  id?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: { hasError: boolean; message: string; messageAr: string } | null;
  isRTL?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onBlur?: () => void;
  showErrorOnBlur?: boolean;
  touched?: boolean;
}

export default function ValidatedInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  isRTL = false,
  required = false,
  disabled = false,
  className = '',
  onBlur,
  touched = true,
}: ValidatedInputProps) {
  const hasError = touched && error?.hasError;
  
  const borderClass = hasError 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' 
    : 'border-gray-200 focus:border-turquoise-500 focus:ring-turquoise-200';

  return (
    <div className={`${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {label}
          {required && <span className="text-red-500 mx-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            focus:outline-none focus:ring-4
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${borderClass}
            ${isRTL ? 'text-right' : 'text-left'}
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        
        {hasError && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'}`}>
            <FiAlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {hasError && (
        <p className={`mt-1.5 text-sm text-red-600 flex items-center gap-1 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{isRTL ? error.messageAr : error.message}</span>
        </p>
      )}
    </div>
  );
}

interface ValidatedTextareaProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: { hasError: boolean; message: string; messageAr: string } | null;
  isRTL?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  onBlur?: () => void;
  touched?: boolean;
  minLength?: number;
  showCharCount?: boolean;
}

export function ValidatedTextarea({
  id,
  value,
  onChange,
  placeholder,
  label,
  error,
  isRTL = false,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  onBlur,
  touched = true,
  minLength,
  showCharCount = false,
}: ValidatedTextareaProps) {
  const hasError = touched && error?.hasError;
  
  const borderClass = hasError 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' 
    : 'border-gray-200 focus:border-turquoise-500 focus:ring-turquoise-200';

  return (
    <div className={`${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium text-gray-700 mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {label}
          {required && <span className="text-red-500 mx-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            focus:outline-none focus:ring-4 resize-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${borderClass}
            ${isRTL ? 'text-right' : 'text-left'}
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>
      
      <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between mt-1.5`}>
        {hasError ? (
          <p className={`text-sm text-red-600 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{isRTL ? error.messageAr : error.message}</span>
          </p>
        ) : <span />}
        
        {showCharCount && minLength && (
          <span className={`text-xs ${value.length >= minLength ? 'text-green-600' : 'text-gray-400'}`}>
            {value.length}/{minLength}+
          </span>
        )}
      </div>
    </div>
  );
}
