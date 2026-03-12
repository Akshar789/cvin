'use client';

import SimpleProfessionalTemplate from '@/components/templates/SimpleProfessionalTemplate';
import MinimalistCleanTemplate from '@/components/templates/MinimalistCleanTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';
import ExecutiveCleanProTemplate from '@/components/templates/ExecutiveCleanProTemplate';
import StructuredSidebarProTemplate from '@/components/templates/StructuredSidebarProTemplate';
import GlobalProfessionalTemplate from '@/components/templates/GlobalProfessionalTemplate';
import ATSUltraProTemplate from '@/components/templates/ATSUltraProTemplate';
import SmartTemplate from '@/components/templates/SmartTemplate';
import StrongTemplate from '@/components/templates/StrongTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import CompactTemplate from '@/components/templates/CompactTemplate';
import TwoColumnProTemplate from '@/components/templates/TwoColumnProTemplate';
import CleanModernTemplate from '@/components/templates/CleanModernTemplate';
import ProfessionalEdgeTemplate from '@/components/templates/ProfessionalEdgeTemplate';
import MetroTemplate from '@/components/templates/MetroTemplate';
import FreshStartTemplate from '@/components/templates/FreshStartTemplate';
import NordicTemplate from '@/components/templates/NordicTemplate';

const TEMPLATE_MAP: Record<string, any> = {
  'classic': ClassicTemplate,
  'classic-ats': ClassicTemplate,
  'ats-optimized': ClassicTemplate,
  'ats': ClassicTemplate,
  'simple-professional': SimpleProfessionalTemplate,
  'simple': SimpleProfessionalTemplate,
  'minimalist-clean': MinimalistCleanTemplate,
  'minimalist': MinimalistCleanTemplate,
  'white-minimalist': MinimalistCleanTemplate,
  'modern': ModernTemplate,
  'executive': ExecutiveTemplate,
  'creative': CreativeTemplate,
  'executive-clean-pro': ExecutiveCleanProTemplate,
  'structured-sidebar-pro': StructuredSidebarProTemplate,
  'global-professional': GlobalProfessionalTemplate,
  'ats-ultra-pro': ATSUltraProTemplate,
  'smart': SmartTemplate,
  'strong': StrongTemplate,
  'elegant': ElegantTemplate,
  'compact': CompactTemplate,
  'two-column-pro': TwoColumnProTemplate,
  'clean-modern': CleanModernTemplate,
  'professional-edge': ProfessionalEdgeTemplate,
  'metro': MetroTemplate,
  'fresh-start': FreshStartTemplate,
  'nordic': NordicTemplate,
};

interface TemplatePreviewProps {
  template: string;
  settings: {
    primaryColor: string;
    accentColor: string;
    headerBg: string;
    photoUrl?: string;
  };
  data: any;
  isRTL?: boolean;
}

export default function TemplatePreview({
  template,
  settings,
  data,
  isRTL = false,
}: TemplatePreviewProps) {
  const templateSlug = String(template).toLowerCase().trim();
  const TemplateComponent = TEMPLATE_MAP[templateSlug] || SimpleProfessionalTemplate;

  return (
    <div className="w-full" style={{ maxWidth: '210mm' }}>
      <TemplateComponent
        data={data}
        previewMode={false}
        isArabic={isRTL}
        settings={settings}
      />
    </div>
  );
}
