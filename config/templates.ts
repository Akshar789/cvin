/**
 * CV Template Configuration
 * 
 * Defines template families and color themes for the CV system.
 */

export interface ColorTheme {
  id: string;
  name: string;
  nameAr: string;
  primary: string;
  secondary: string;
  accent: string;
  headerBg: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface TemplateFamily {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  isPremium: boolean;
  features: string[];
  featuresAr: string[];
  previewType: 'ats' | 'modern' | 'creative' | 'minimal';
  supportedColorThemes: string[];
  layout: {
    type: 'single-column' | 'sidebar' | 'centered' | 'two-column';
    columns: number;
    photoPosition: 'none' | 'header' | 'sidebar' | 'corner';
  };
  cssStyles: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
}

// Color Themes
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'blue',
    name: 'Professional Blue',
    nameAr: 'الأزرق الاحترافي',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    headerBg: '#1e3a8a',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#cbd5e1',
  },
  {
    id: 'green',
    name: 'Fresh Green',
    nameAr: 'الأخضر المنعش',
    primary: '#166534',
    secondary: '#22c55e',
    accent: '#4ade80',
    headerBg: '#14532d',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#d1d5db',
  },
  {
    id: 'gold',
    name: 'Elegant Gold',
    nameAr: 'الذهبي الأنيق',
    primary: '#92400e',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    headerBg: '#78350f',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#d1d5db',
  },
  {
    id: 'purple',
    name: 'Creative Purple',
    nameAr: 'الأرجواني الإبداعي',
    primary: '#6b21a8',
    secondary: '#a855f7',
    accent: '#c084fc',
    headerBg: '#581c87',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    border: '#d1d5db',
  },
  {
    id: 'gray',
    name: 'Classic Gray',
    nameAr: 'الرمادي الكلاسيكي',
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#9ca3af',
    headerBg: '#1f2937',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
  },
];

// Template Families
export const TEMPLATE_FAMILIES: TemplateFamily[] = [
  {
    id: 'simple-professional',
    name: 'Simple Professional',
    nameAr: 'بسيط احترافي',
    description: 'Gray and white simple professional template with clean layout and right-aligned contact info.',
    descriptionAr: 'قالب احترافي بسيط باللون الرمادي والأبيض بتخطيط نظيف ومعلومات الاتصال محاذاة لليمين.',
    isPremium: false,
    features: ['Simple Design', 'Gray & White', 'Clean Layout', 'Professional'],
    featuresAr: ['تصميم بسيط', 'رمادي وأبيض', 'تخطيط نظيف', 'احترافي'],
    previewType: 'ats',
    supportedColorThemes: ['gray', 'blue'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    nameAr: 'بسيط نظيف',
    description: 'White minimalist clean template with simple design and numbered contact information.',
    descriptionAr: 'قالب نظيف بسيط باللون الأبيض بتصميم بسيط ومعلومات اتصال مرقمة.',
    isPremium: false,
    features: ['Minimalist', 'White & Clean', 'Simple Design', 'Professional'],
    featuresAr: ['بسيط', 'أبيض ونظيف', 'تصميم بسيط', 'احترافي'],
    previewType: 'minimal',
    supportedColorThemes: ['gray', 'blue'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.6',
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    nameAr: 'كلاسيكي',
    description: 'Single-column professional layout with italic serif name and circular icon contact info.',
    descriptionAr: 'تخطيط احترافي بعمود واحد مع اسم بخط مائل ومعلومات اتصال بأيقونات دائرية.',
    isPremium: true,
    features: ['Classic Design', 'Single Column', 'Serif Typography', 'Professional'],
    featuresAr: ['تصميم كلاسيكي', 'عمود واحد', 'طباعة بخط serif', 'احترافي'],
    previewType: 'ats',
    supportedColorThemes: ['blue', 'gold', 'gray', 'green'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '11pt',
      lineHeight: '1.6',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    nameAr: 'عصري',
    description: 'Bold indigo sidebar with vibrant accents. Perfect for creative professionals and modern industries.',
    descriptionAr: 'شريط جانبي نيلي جريء مع لمسات نابضة بالحياة. مثالي للمحترفين المبدعين والصناعات الحديثة.',
    isPremium: false,
    features: ['Sidebar Layout', 'Bold Colors', 'Creative Design', 'Modern'],
    featuresAr: ['تخطيط شريط جانبي', 'ألوان جريئة', 'تصميم إبداعي', 'عصري'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'purple', 'teal', 'green'],
    layout: {
      type: 'sidebar',
      columns: 2,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'executive',
    name: 'Executive',
    nameAr: 'تنفيذي',
    description: 'Premium executive template with elegant header and structured sections. Designed for C-level and senior positions.',
    descriptionAr: 'قالب تنفيذي متميز مع رأس أنيق وأقسام منظمة. مصمم للمناصب العليا والقيادية.',
    isPremium: true,
    features: ['Executive Style', 'Elegant Header', 'Structured Sections', 'Premium'],
    featuresAr: ['أسلوب تنفيذي', 'رأس أنيق', 'أقسام منظمة', 'متميز'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'gold', 'gray'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '11pt',
      lineHeight: '1.6',
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    nameAr: 'إبداعي',
    description: 'Vibrant and eye-catching template with creative layout elements. Perfect for designers and marketers.',
    descriptionAr: 'قالب نابض بالحياة وملفت للنظر مع عناصر تخطيط إبداعية. مثالي للمصممين والمسوقين.',
    isPremium: true,
    features: ['Creative Layout', 'Vibrant Colors', 'Eye-catching', 'Design-focused'],
    featuresAr: ['تخطيط إبداعي', 'ألوان نابضة', 'ملفت للنظر', 'مركز على التصميم'],
    previewType: 'creative',
    supportedColorThemes: ['purple', 'blue', 'teal', 'green'],
    layout: {
      type: 'sidebar',
      columns: 2,
      photoPosition: 'sidebar',
    },
    cssStyles: {
      fontFamily: '"Poppins", "Segoe UI", sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'executive-clean-pro',
    name: 'Executive Clean Pro',
    nameAr: 'تنفيذي نظيف برو',
    description: 'Ultra-clean executive template with minimal decoration. ATS-optimized for senior management roles.',
    descriptionAr: 'قالب تنفيذي فائق النظافة مع حد أدنى من الزخرفة. محسّن لـ ATS للمناصب الإدارية العليا.',
    isPremium: true,
    features: ['Ultra Clean', 'ATS-Optimized', 'Executive', 'Minimal'],
    featuresAr: ['فائق النظافة', 'محسّن لـ ATS', 'تنفيذي', 'بسيط'],
    previewType: 'ats',
    supportedColorThemes: ['blue', 'gray', 'gold'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'structured-sidebar-pro',
    name: 'Structured Sidebar Pro',
    nameAr: 'شريط جانبي منظم برو',
    description: 'Professional two-column template with structured sidebar for skills and education.',
    descriptionAr: 'قالب احترافي بعمودين مع شريط جانبي منظم للمهارات والتعليم.',
    isPremium: true,
    features: ['Structured Sidebar', 'Two Columns', 'Organized', 'Professional'],
    featuresAr: ['شريط جانبي منظم', 'عمودين', 'منظم', 'احترافي'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'green', 'purple', 'teal'],
    layout: {
      type: 'sidebar',
      columns: 2,
      photoPosition: 'sidebar',
    },
    cssStyles: {
      fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'global-professional',
    name: 'Global Professional',
    nameAr: 'احترافي عالمي',
    description: 'Internationally-styled professional template suitable for global job markets.',
    descriptionAr: 'قالب احترافي بأسلوب دولي مناسب لأسواق العمل العالمية.',
    isPremium: true,
    features: ['International Style', 'Global Standard', 'Professional', 'Versatile'],
    featuresAr: ['أسلوب دولي', 'معيار عالمي', 'احترافي', 'متعدد الاستخدامات'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'gray', 'green'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'ats-ultra-pro',
    name: 'ATS Ultra Pro',
    nameAr: 'ATS ألترا برو',
    description: 'Maximum ATS compatibility with clean formatting. Guaranteed to pass all major ATS systems.',
    descriptionAr: 'أقصى توافق مع ATS بتنسيق نظيف. مضمون اجتياز جميع أنظمة ATS الرئيسية.',
    isPremium: true,
    features: ['Maximum ATS Score', 'Clean Format', 'Guaranteed Pass', 'Professional'],
    featuresAr: ['أقصى درجة ATS', 'تنسيق نظيف', 'اجتياز مضمون', 'احترافي'],
    previewType: 'ats',
    supportedColorThemes: ['blue', 'gray'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'smart',
    name: 'Smart',
    nameAr: 'ذكي',
    description: 'Modern template with colored header and clean sections. Perfect for tech professionals and modern industries.',
    descriptionAr: 'قالب عصري مع رأس ملون وأقسام نظيفة. مثالي للمحترفين التقنيين والصناعات الحديثة.',
    isPremium: false,
    features: ['Colored Header', 'Clean Sections', 'Modern Design', 'ATS-Friendly'],
    featuresAr: ['رأس ملون', 'أقسام نظيفة', 'تصميم عصري', 'متوافق مع ATS'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'teal', 'green', 'purple'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'strong',
    name: 'Strong',
    nameAr: 'قوي',
    description: 'Bold and powerful template with strong typography and left border accent. Ideal for leadership positions.',
    descriptionAr: 'قالب جريء وقوي مع طباعة قوية وحد أيسر مميز. مثالي للمناصب القيادية.',
    isPremium: false,
    features: ['Bold Typography', 'Strong Design', 'Leadership Focus', 'Professional'],
    featuresAr: ['طباعة جريئة', 'تصميم قوي', 'تركيز قيادي', 'احترافي'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'gray', 'gold'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    nameAr: 'أنيق',
    description: 'Sophisticated template with centered layout and elegant typography. Perfect for creative and executive roles.',
    descriptionAr: 'قالب متطور مع تخطيط مركزي وطباعة أنيقة. مثالي للأدوار الإبداعية والتنفيذية.',
    isPremium: false,
    features: ['Centered Layout', 'Elegant Typography', 'Sophisticated', 'Creative'],
    featuresAr: ['تخطيط مركزي', 'طباعة أنيقة', 'متطور', 'إبداعي'],
    previewType: 'creative',
    supportedColorThemes: ['purple', 'blue', 'gold', 'gray'],
    layout: {
      type: 'centered',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'compact',
    name: 'Compact',
    nameAr: 'مضغوط',
    description: 'Space-efficient template that fits more content on one page. Ideal for experienced professionals with extensive backgrounds.',
    descriptionAr: 'قالب موفر للمساحة يتسع لمزيد من المحتوى في صفحة واحدة. مثالي للمحترفين ذوي الخبرة الواسعة.',
    isPremium: false,
    features: ['Space Efficient', 'Compact Design', 'More Content', 'Professional'],
    featuresAr: ['موفر للمساحة', 'تصميم مضغوط', 'محتوى أكثر', 'احترافي'],
    previewType: 'ats',
    supportedColorThemes: ['green', 'blue', 'gray'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Calibri, Arial, sans-serif',
      fontSize: '9pt',
      lineHeight: '1.4',
    },
  },
  {
    id: 'two-column-pro',
    name: 'Two Column Pro',
    nameAr: 'عمودين برو',
    description: 'Professional two-column layout with colored header and sidebar. Experience on left, education and skills on right.',
    descriptionAr: 'تخطيط احترافي بعمودين مع رأس ملون وشريط جانبي. الخبرة على اليسار، التعليم والمهارات على اليمين.',
    isPremium: false,
    features: ['Two Columns', 'Colored Header', 'Sidebar Layout', 'Professional'],
    featuresAr: ['عمودين', 'رأس ملون', 'تخطيط شريط جانبي', 'احترافي'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'green', 'purple', 'teal'],
    layout: {
      type: 'two-column',
      columns: 2,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'clean-modern',
    name: 'Clean Modern',
    nameAr: 'عصري نظيف',
    description: 'Single-column layout with accent-colored left border bars on section headings and modern typography.',
    descriptionAr: 'تخطيط عمود واحد مع أشرطة حدودية ملونة على عناوين الأقسام وطباعة عصرية.',
    isPremium: false,
    features: ['Modern Design', 'Left Border Accents', 'Clean Layout', 'ATS-Friendly'],
    featuresAr: ['تصميم عصري', 'لمسات حدودية', 'تخطيط نظيف', 'متوافق مع ATS'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'green', 'purple', 'gray'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'professional-edge',
    name: 'Professional Edge',
    nameAr: 'حافة احترافية',
    description: 'Colored top banner with name and title, followed by structured sections with underline dividers.',
    descriptionAr: 'شريط ملون علوي مع الاسم والمسمى الوظيفي، متبوعاً بأقسام منظمة مع فواصل تحتية.',
    isPremium: false,
    features: ['Colored Banner', 'Structured Sections', 'Underline Dividers', 'Professional'],
    featuresAr: ['شريط ملون', 'أقسام منظمة', 'فواصل تحتية', 'احترافي'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'green', 'gold', 'gray'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'metro',
    name: 'Metro',
    nameAr: 'مترو',
    description: 'Flat metro-inspired design with bold colored header block and geometric section headings.',
    descriptionAr: 'تصميم مستوحى من أسلوب المترو مع رأس ملون جريء وعناوين أقسام هندسية.',
    isPremium: false,
    features: ['Metro Design', 'Bold Header', 'Geometric Style', 'ATS-Friendly'],
    featuresAr: ['تصميم مترو', 'رأس جريء', 'أسلوب هندسي', 'متوافق مع ATS'],
    previewType: 'modern',
    supportedColorThemes: ['blue', 'purple', 'teal', 'green'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'fresh-start',
    name: 'Fresh Start',
    nameAr: 'بداية جديدة',
    description: 'Entry-level friendly template with pill-shaped headings and a warm, approachable design.',
    descriptionAr: 'قالب مناسب لحديثي التخرج مع عناوين بشكل حبة دواء وتصميم دافئ وودود.',
    isPremium: false,
    features: ['Entry-Level', 'Pill Headings', 'Warm Design', 'Approachable'],
    featuresAr: ['مستوى مبتدئ', 'عناوين مستديرة', 'تصميم دافئ', 'ودود'],
    previewType: 'minimal',
    supportedColorThemes: ['blue', 'green', 'purple', 'gold'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
    },
  },
  {
    id: 'nordic',
    name: 'Nordic',
    nameAr: 'نورديك',
    description: 'Ultra-minimal Scandinavian-inspired design with hairline dividers and maximum whitespace.',
    descriptionAr: 'تصميم فائق البساطة مستوحى من الطراز الاسكندنافي مع فواصل رفيعة ومساحات بيضاء واسعة.',
    isPremium: false,
    features: ['Scandinavian Style', 'Ultra Minimal', 'Hairline Dividers', 'Elegant'],
    featuresAr: ['أسلوب اسكندنافي', 'فائق البساطة', 'فواصل رفيعة', 'أنيق'],
    previewType: 'minimal',
    supportedColorThemes: ['gray', 'blue', 'green'],
    layout: {
      type: 'single-column',
      columns: 1,
      photoPosition: 'none',
    },
    cssStyles: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.6',
    },
  },
];

// Legacy template mappings for backward compatibility
export const CVTemplates = {
  modern: {
    id: 5,
    name: 'Modern Professional',
    description: 'Bold indigo sidebar with vibrant orange accents. Perfect for creative professionals and modern industries.',
    isPremium: false,
    previewImage: '/templates/modern-preview.png',
    layout: {
      type: 'sidebar',
      columns: 2,
      photoPosition: 'none',
      colorScheme: 'indigo-orange',
    },
    cssStyles: {
      primaryColor: '#1e3a8a',
      accentColor: '#fb923c',
      fontFamily: 'Inter, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
    },
  },
  classic: {
    id: 6,
    name: 'Classic Professional',
    description: 'Executive navy blue with elegant gold accents. ATS-optimized and recruiter-friendly for traditional industries.',
    isPremium: true,
    previewImage: '/templates/classic-preview.png',
    layout: {
      type: 'centered',
      columns: 1,
      photoPosition: 'none',
      colorScheme: 'navy-gold',
    },
    cssStyles: {
      primaryColor: '#1e3a8a',
      accentColor: '#f59e0b',
      fontFamily: 'Georgia, serif',
      fontSize: '11pt',
      lineHeight: '1.6',
    },
  },
};

export type TemplateConfig = typeof CVTemplates.modern;

// Get template by ID
export function getTemplateFamily(id: string): TemplateFamily | undefined {
  return TEMPLATE_FAMILIES.find(t => t.id === id);
}

// Get color theme by ID
export function getColorTheme(id: string): ColorTheme | undefined {
  return COLOR_THEMES.find(t => t.id === id);
}

// Get default color theme for a template
export function getDefaultColorTheme(templateId: string): ColorTheme {
  const template = getTemplateFamily(templateId);
  if (template && template.supportedColorThemes.length > 0) {
    return getColorTheme(template.supportedColorThemes[0]) || COLOR_THEMES[0];
  }
  return COLOR_THEMES[0];
}

// Check if theme is supported by template
export function isThemeSupportedByTemplate(templateId: string, themeId: string): boolean {
  const template = getTemplateFamily(templateId);
  return template?.supportedColorThemes.includes(themeId) || false;
}

// CSS Variables for themes
export function getThemeCSSVariables(theme: ColorTheme): Record<string, string> {
  return {
    '--cv-primary': theme.primary,
    '--cv-secondary': theme.secondary,
    '--cv-accent': theme.accent,
    '--cv-header-bg': theme.headerBg,
    '--cv-text-primary': theme.textPrimary,
    '--cv-text-secondary': theme.textSecondary,
    '--cv-border': theme.border,
  };
}
