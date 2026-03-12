'use client';

import { useMemo } from 'react';
import { FiCheck, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import { validateCV, CVValidationResult, SECTION_ORDER } from '@/lib/cv/validation';

interface SectionChecklistProps {
  cvData: any;
  currentSection?: string;
  onSectionClick?: (sectionId: string) => void;
  isRTL?: boolean;
  isFreshGraduate?: boolean;
}

const SECTION_ICONS: Record<string, string> = {
  personalInfo: '👤',
  summary: '📝',
  education: '🎓',
  experience: '💼',
  certifications: '📜',
  skills: '⚡',
  languages: '🌐',
};

export default function SectionChecklist({
  cvData,
  currentSection,
  onSectionClick,
  isRTL = false,
  isFreshGraduate = false,
}: SectionChecklistProps) {
  const validation = useMemo(() => {
    return validateCV(cvData, { isFreshGraduate });
  }, [cvData, isFreshGraduate]);

  const getSectionByOrder = (order: string[]) => {
    return order.map(id => validation.sections.find(s => s.id === id)).filter(Boolean);
  };

  const orderedSections = getSectionByOrder(SECTION_ORDER);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="p-4 bg-gradient-to-r from-navy-50 to-turquoise-50 border-b border-gray-100">
        <h3 className="font-bold text-navy-800 text-sm">
          {isRTL ? 'قائمة الأقسام المطلوبة' : 'Required Sections Checklist'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {isRTL 
            ? `${validation.completedSections} من ${validation.totalSections} أقسام مكتملة`
            : `${validation.completedSections} of ${validation.totalSections} sections complete`
          }
        </p>
        
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-turquoise-500 to-turquoise-600 transition-all duration-500"
            style={{ width: `${(validation.completedSections / validation.totalSections) * 100}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {orderedSections.map((section) => {
          if (!section) return null;
          const isActive = currentSection === section.id;
          const icon = SECTION_ICONS[section.id] || '📋';

          return (
            <button
              key={section.id}
              onClick={() => onSectionClick?.(section.id)}
              className={`w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-turquoise-50' : ''
              }`}
            >
              <span className="text-lg">{icon}</span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm truncate ${
                    section.isComplete ? 'text-gray-700' : 'text-gray-900'
                  }`}>
                    {isRTL ? section.nameAr : section.name}
                  </span>
                </div>
                
                {!section.isComplete && section.errors.length > 0 && (
                  <p className="text-xs text-red-500 truncate mt-0.5">
                    {isRTL 
                      ? `${section.errors.length} ${section.errors.length === 1 ? 'خطأ' : 'أخطاء'}`
                      : `${section.errors.length} ${section.errors.length === 1 ? 'error' : 'errors'}`
                    }
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {section.isComplete ? (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <FiAlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
                
                {isActive && (
                  <FiChevronRight className={`w-4 h-4 text-turquoise-600 ${isRTL ? 'rotate-180' : ''}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!validation.isValid && (
        <div className="p-4 bg-amber-50 border-t border-amber-100">
          <p className="text-xs text-amber-700 flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              {isRTL 
                ? 'يرجى إكمال جميع الأقسام المطلوبة قبل تحميل السيرة الذاتية'
                : 'Please complete all required sections before downloading your CV'
              }
            </span>
          </p>
        </div>
      )}

      {validation.isValid && (
        <div className="p-4 bg-green-50 border-t border-green-100">
          <p className="text-xs text-green-700 flex items-center gap-2">
            <FiCheck className="w-4 h-4" />
            <span>
              {isRTL 
                ? 'جميع الأقسام مكتملة! يمكنك تحميل السيرة الذاتية الآن'
                : 'All sections complete! You can now download your CV'
              }
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// Inline Validation Errors Component
interface InlineValidationProps {
  errors: Array<{ field: string; message: string; messageAr: string }>;
  isRTL?: boolean;
}

export function InlineValidationErrors({ errors, isRTL = false }: InlineValidationProps) {
  if (errors.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {errors.map((error, index) => (
        <p key={index} className="text-sm text-red-600 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{isRTL ? error.messageAr : error.message}</span>
        </p>
      ))}
    </div>
  );
}

// Validation Gate Component - Blocks progress if validation fails
interface ValidationGateProps {
  cvData: any;
  onValidationChange?: (isValid: boolean) => void;
  children: React.ReactNode;
  isRTL?: boolean;
  isFreshGraduate?: boolean;
}

export function ValidationGate({ 
  cvData, 
  onValidationChange, 
  children, 
  isRTL = false,
  isFreshGraduate = false 
}: ValidationGateProps) {
  const validation = useMemo(() => {
    return validateCV(cvData, { isFreshGraduate });
  }, [cvData, isFreshGraduate]);

  useMemo(() => {
    onValidationChange?.(validation.isValid);
  }, [validation.isValid, onValidationChange]);

  return (
    <div className="relative">
      {children}
      
      {!validation.isValid && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 max-w-md mx-4 text-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">
              {isRTL ? 'أقسام غير مكتملة' : 'Incomplete Sections'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isRTL 
                ? 'يرجى إكمال جميع الأقسام المطلوبة للمتابعة'
                : 'Please complete all required sections to continue'
              }
            </p>
            <div className="text-left space-y-1">
              {validation.sections.filter(s => !s.isComplete).map(section => (
                <div key={section.id} className="flex items-center gap-2 text-sm text-red-600">
                  <FiAlertCircle className="w-4 h-4" />
                  <span>{isRTL ? section.nameAr : section.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
