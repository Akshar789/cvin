'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface Option {
  value: string;
  labelEn: string;
  labelAr: string;
  keywords?: string[];
}

interface SmartSearchDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  placeholderAr?: string;
  label?: string;
  labelAr?: string;
  required?: boolean;
  recommended?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
  customPlaceholderAr?: string;
  className?: string;
}

export default function SmartSearchDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  placeholderAr = 'اختر...',
  label,
  labelAr,
  required = false,
  recommended = false,
  allowCustom = false,
  customPlaceholder = 'Add custom...',
  customPlaceholderAr = 'أضف مخصص...',
  className = '',
}: SmartSearchDropdownProps) {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return options.filter(option => {
      const matchesEn = option.labelEn.toLowerCase().includes(query);
      const matchesAr = option.labelAr.includes(searchQuery.trim());
      const matchesValue = option.value.toLowerCase().includes(query);
      const matchesKeywords = option.keywords?.some(kw => 
        kw.toLowerCase().includes(query)
      );
      
      return matchesEn || matchesAr || matchesValue || matchesKeywords;
    });
  }, [options, searchQuery]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption 
    ? (isRTL ? selectedOption.labelAr : selectedOption.labelEn)
    : value || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        } else if (allowCustom && searchQuery.trim()) {
          onChange(searchQuery.trim());
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {isRTL ? labelAr : label}
          {required && <span className="text-red-500 mx-1">*</span>}
          {recommended && !required && (
            <span className="text-blue-500 text-xs mx-1">
              ({isRTL ? 'موصى به' : 'Recommended'})
            </span>
          )}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          w-full px-4 py-3 text-${isRTL ? 'right' : 'left'} bg-white border rounded-xl
          flex items-center justify-between gap-2
          transition-all duration-200
          ${isOpen 
            ? 'border-turquoise-500 ring-2 ring-turquoise-100' 
            : 'border-gray-200 hover:border-gray-300'
          }
          ${!displayValue ? 'text-gray-400' : 'text-gray-900'}
        `}
      >
        <span className="truncate">
          {displayValue || (isRTL ? placeholderAr : placeholder)}
        </span>
        <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`
          absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl
          overflow-hidden
          ${isRTL ? 'right-0' : 'left-0'}
        `}>
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <FiSearch className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-gray-400`} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRTL ? 'ابحث...' : 'Search...'}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-turquoise-400`}
                style={{ 
                  fontSize: '16px',
                  WebkitTextFillColor: '#111827',
                  opacity: 1
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {allowCustom ? (
                  <button
                    onClick={() => handleSelect(searchQuery.trim())}
                    className="w-full py-2 px-4 bg-turquoise-50 text-turquoise-700 rounded-lg hover:bg-turquoise-100 transition-colors"
                  >
                    {isRTL ? `إضافة "${searchQuery}"` : `Add "${searchQuery}"`}
                  </button>
                ) : (
                  <span>{isRTL ? 'لا توجد نتائج' : 'No results found'}</span>
                )}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-${isRTL ? 'right' : 'left'} flex items-center justify-between
                    transition-colors
                    ${index === highlightedIndex ? 'bg-turquoise-50' : 'hover:bg-gray-50'}
                    ${option.value === value ? 'bg-turquoise-50' : ''}
                  `}
                >
                  <div>
                    <span className="text-gray-900">
                      {isRTL ? option.labelAr : option.labelEn}
                    </span>
                    <span className="text-gray-400 text-sm mx-2">
                      {isRTL ? option.labelEn : option.labelAr}
                    </span>
                  </div>
                  {option.value === value && (
                    <FiCheck className="w-5 h-5 text-turquoise-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {allowCustom && filteredOptions.length > 0 && searchQuery.trim() && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => handleSelect(searchQuery.trim())}
                className="w-full py-2 px-4 text-sm text-turquoise-700 hover:bg-turquoise-50 rounded-lg transition-colors text-center"
              >
                {isRTL ? customPlaceholderAr : customPlaceholder}: "{searchQuery}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
