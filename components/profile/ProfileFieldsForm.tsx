'use client';

import React, { useMemo } from 'react';
import SmartSearchDropdown from '@/components/ui/SmartSearchDropdown';
import { JOB_DOMAINS } from '@/lib/constants/jobDomains';
import { INDUSTRIES } from '@/lib/constants/profileOptions';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface ProfileFieldsFormProps {
  targetJobDomain: string;
  industry: string;
  onTargetJobDomainChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  showLabels?: boolean;
  required?: boolean;
}

export default function ProfileFieldsForm({
  targetJobDomain,
  industry,
  onTargetJobDomainChange,
  onIndustryChange,
  showLabels = true,
  required = true,
}: ProfileFieldsFormProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const jobDomainOptions = useMemo(() => 
    JOB_DOMAINS.map(domain => ({
      value: domain.id,
      labelEn: domain.nameEn,
      labelAr: domain.nameAr,
      keywords: domain.keywords
    })), 
  []);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <SmartSearchDropdown
        options={jobDomainOptions}
        value={targetJobDomain || ''}
        onChange={onTargetJobDomainChange}
        label="Target Job Domain"
        labelAr="المجال الوظيفي المستهدف"
        placeholder="Search job domains..."
        placeholderAr="ابحث عن مجال وظيفي..."
        required={required}
        allowCustom={true}
        customPlaceholder="Add custom domain"
        customPlaceholderAr="إضافة مجال مخصص"
      />

      <SmartSearchDropdown
        options={INDUSTRIES}
        value={industry || ''}
        onChange={onIndustryChange}
        label="Industry"
        labelAr="القطاع"
        placeholder="Search industries..."
        placeholderAr="ابحث عن قطاع..."
        required={required}
        allowCustom={true}
        customPlaceholder="Add custom industry"
        customPlaceholderAr="إضافة قطاع مخصص"
      />
    </div>
  );
}

export function getJobDomainDisplayName(domainValue: string, isRTL: boolean): string {
  if (!domainValue) return isRTL ? 'غير محدد' : 'Not specified';
  
  const domain = JOB_DOMAINS.find(d => d.id === domainValue);
  if (domain) {
    return isRTL ? domain.nameAr : domain.nameEn;
  }
  return domainValue;
}

export function getIndustryDisplayName(industryValue: string, isRTL: boolean): string {
  if (!industryValue) return isRTL ? 'غير محدد' : 'Not specified';
  
  const ind = INDUSTRIES.find(i => i.value === industryValue);
  if (ind) {
    return isRTL ? ind.labelAr : ind.labelEn;
  }
  return industryValue;
}
