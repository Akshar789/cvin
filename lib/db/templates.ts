export const defaultTemplates = [
  {
    name: 'Professional Classic',
    description: 'Clean, ATS-friendly template perfect for most industries',
    isPremium: false,
    language: 'en',
    previewImage: '/templates/professional-classic.png',
    cssStyles: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
      },
    },
    layout: {
      sections: ['header', 'summary', 'experience', 'education', 'skills'],
      columnCount: 1,
      spacing: 'normal',
    },
  },
  {
    name: 'Simple Professional',
    description: 'Gray and white simple professional template with clean layout',
    isPremium: false,
    language: 'en',
    previewImage: '/templates/simple-professional.png',
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.5',
      colors: {
        primary: '#333333',
        secondary: '#666666',
        accent: '#555555',
      },
    },
    layout: {
      sections: ['header', 'summary', 'experience', 'education', 'skills', 'languages'],
      columnCount: 1,
      spacing: 'normal',
    },
  },
  {
    name: 'Minimalist Clean',
    description: 'White minimalist clean template with simple design and numbered contact info',
    isPremium: false,
    language: 'en',
    previewImage: '/templates/minimalist-clean.png',
    cssStyles: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.6',
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#666666',
      },
    },
    layout: {
      sections: ['header', 'summary', 'experience', 'education', 'skills', 'certifications'],
      columnCount: 1,
      spacing: 'normal',
    },
  },
  {
    name: 'احترافي كلاسيكي',
    description: 'قالب نظيف ومتوافق مع ATS مثالي لمعظم الصناعات',
    isPremium: false,
    language: 'ar',
    previewImage: '/templates/professional-classic-ar.png',
    cssStyles: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      direction: 'rtl',
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
      },
    },
    layout: {
      sections: ['header', 'summary', 'experience', 'education', 'skills'],
      columnCount: 1,
      spacing: 'normal',
    },
  },
];
