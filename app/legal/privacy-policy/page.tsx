'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function PrivacyPolicy() {
  const { isRTL } = useLanguage();

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: November 2024',
      sections: [
        {
          heading: '1. Introduction & Legal Basis',
          content: 'CVin ("we", "us", "our") is committed to protecting your personal data in compliance with Saudi Arabia\'s Personal Data Protection Law (PDPL) and SDAIA guidelines. This Privacy Policy explains how we collect, use, store, and protect your personal information.'
        },
        {
          heading: '2. Data We Collect',
          content: 'We collect the following categories of personal data:\n• Account Information: Name, email, phone number, username\n• Professional Data: Job title, industry, career level, years of experience, education level, degree level, education specialization\n• Location Data: Country, city\n• Uploaded Documents: CVs, job descriptions\n• Career Preferences: Target jobs, industries, strengths, career interests\n• Language Preferences: Preferred communication language\n• Technical Data: IP address, browser type, device type (for security and analytics)'
        },
        {
          heading: '3. Purpose of Data Collection',
          content: 'We use your data for the following lawful purposes:\n• To generate personalized CV content using AI\n• To provide and improve our platform services\n• To generate job-matching recommendations\n• To communicate important platform updates\n• To comply with legal obligations\n• To detect and prevent fraud'
        },
        {
          heading: '4. Data Retention Period',
          content: 'Account data: Retained for the duration of your account + 30 days after deletion\nUploaded documents: Retained until you request deletion\nConsent records: Retained for 5 years (PDPL requirement for audit trails)\nActivity logs: Retained for 12 months\nYou can request deletion of any data at any time.'
        },
        {
          heading: '5. User Rights Under PDPL',
          content: 'You have the following rights under Saudi Arabia\'s PDPL:\n• Right to Access: Request a copy of all personal data we hold about you\n• Right to Correction: Request correction of inaccurate data\n• Right to Deletion: Request deletion of your data (Right to be Forgotten)\n• Right to Restrict Processing: Limit how we use your data\n• Right to Withdraw Consent: Withdraw consent for any data processing at any time\n• Right to Data Portability: Receive your data in a portable format\n\nTo exercise any of these rights, contact us at privacy@cvin.com'
        },
        {
          heading: '6. Data Storage & Security',
          content: 'Your data is stored on secure servers located in Saudi Arabia and compliant regions only. We use:\n• Encryption (AES-256) for data in transit and at rest\n• Regular security audits\n• Access controls and authentication\n• Backup procedures\n• We do NOT transfer personal data outside Saudi Arabia without explicit consent'
        },
        {
          heading: '7. AI Processing & Data Usage',
          content: 'Your personal data is used ONLY to:\n• Generate your CV content\n• Create job recommendations\n• Improve your CV quality\n\nWe do NOT:\n• Use your data to train external AI models\n• Share your data with third-party AI providers without consent\n• Create profiles for sale or marketing\n• Sell your data to recruiters or companies'
        },
        {
          heading: '8. Third Parties & Data Sharing',
          content: 'We do NOT share your personal data with third parties except:\n• With your explicit consent\n• To comply with legal requirements\n• With our AI provider (OpenAI) - only for CV generation, under strict data processing agreements\n• All third parties are required to comply with PDPL and maintain equivalent data protection'
        },
        {
          heading: '9. Cross-Border Data Transfers',
          content: 'Under PDPL requirements, we maintain data within Saudi Arabia and compliant regions. Any international data transfer requires:\n• Your explicit written consent\n• Equivalent data protection standards\n• Data Processing Agreements with third parties'
        },
        {
          heading: '10. Children\'s Data',
          content: 'CVin is not directed at individuals under 18 years of age. We do not knowingly collect data from children. If we become aware that we have collected data from a child, we will delete it immediately.'
        },
        {
          heading: '11. Contact & Data Protection Officer',
          content: 'Data Protection Officer: privacy@cvin.com\nFor inquiries about your data or to exercise your rights:\nEmail: privacy@cvin.com\nAddress: CVin, Saudi Arabia\nResponse time: Within 30 days as required by PDPL'
        },
        {
          heading: '12. Changes to This Policy',
          content: 'We may update this Privacy Policy. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of the platform constitutes acceptance of the updated policy.'
        }
      ]
    },
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: نوفمبر 2024',
      sections: [
        {
          heading: 'مقدمة والأساس القانوني',
          content: 'CVin ("نحن"، "لنا"، "موقعنا") ملتزمة بحماية بيانات شخصك وفقاً لنظام حماية البيانات الشخصية السعودي وإرشادات هيئة البيانات والذكاء الاصطناعي. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وتخزيننا وحمايتنا لمعلوماتك الشخصية.'
        },
        {
          heading: 'البيانات التي نجمعها',
          content: 'نجمع الفئات التالية من البيانات الشخصية:\n• بيانات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف، اسم المستخدم\n• البيانات المهنية: المسمى الوظيفي، الصناعة، مستوى الخبرة، سنوات الخبرة، المستوى التعليمي، مستوى الدرجة العلمية، التخصص الأكاديمي\n• بيانات الموقع: الدولة، المدينة\n• المستندات المرفوعة: السيرة الذاتية، وصف الوظيفة\n• تفضيلات المسار الوظيفي: الوظائف المستهدفة، الصناعات، نقاط القوة، اهتمامات المسار الوظيفي\n• تفضيلات اللغة: لغة الاتصال المفضلة\n• البيانات التقنية: عنوان IP، نوع المتصفح، نوع الجهاز'
        },
        {
          heading: 'غرض جمع البيانات',
          content: 'نستخدم بياناتك للأغراض القانونية التالية:\n• لإنشاء محتوى السيرة الذاتية الشخصي باستخدام الذكاء الاصطناعي\n• لتقديم وتحسين خدمات منصتنا\n• لإنشاء توصيات تطابق الوظائف\n• للتواصل مع تحديثات المنصة المهمة\n• للامتثال للالتزامات القانونية\n• لاكتشاف ومنع الاحتيال'
        },
        {
          heading: 'فترة الاحتفاظ بالبيانات',
          content: 'بيانات الحساب: يتم الاحتفاظ بها طوال مدة حسابك + 30 يوماً بعد الحذف\nالمستندات المرفوعة: يتم الاحتفاظ بها حتى تطلب الحذف\nسجلات الموافقة: يتم الاحتفاظ بها لمدة 5 سنوات (متطلب نظام حماية البيانات للفحوصات الدقيقة)\nسجلات النشاط: يتم الاحتفاظ بها لمدة 12 شهراً\nيمكنك طلب حذف أي بيانات في أي وقت.'
        },
        {
          heading: 'حقوقك وفقاً لنظام حماية البيانات',
          content: 'لديك الحقوق التالية بموجب نظام حماية البيانات الشخصية السعودي:\n• الحق في الوصول: اطلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك\n• الحق في التصحيح: اطلب تصحيح البيانات غير الدقيقة\n• الحق في الحذف: اطلب حذف بياناتك (الحق في النسيان)\n• الحق في تقييد المعالجة: حدد كيفية استخدام بياناتك\n• الحق في سحب الموافقة: سحب الموافقة على معالجة البيانات في أي وقت\n• الحق في نقل البيانات: احصل على بياناتك بصيغة قابلة للنقل\n\nلممارسة أي من هذه الحقوق، اتصل بنا على privacy@cvin.com'
        },
        {
          heading: 'تخزين البيانات والأمان',
          content: 'يتم تخزين بياناتك على خوادم آمنة تقع في المملكة العربية السعودية والمناطق المتوافقة فقط. نستخدم:\n• التشفير (AES-256) للبيانات أثناء النقل والتخزين\n• عمليات التدقيق الأمني العادية\n• تحكم الوصول والمصادقة\n• إجراءات النسخ الاحتياطي\n• نحن لا ننقل البيانات الشخصية خارج المملكة العربية السعودية بدون موافقة صريحة'
        },
        {
          heading: 'معالجة الذكاء الاصطناعي واستخدام البيانات',
          content: 'يتم استخدام بياناتك الشخصية فقط لـ:\n• إنشاء محتوى السيرة الذاتية الخاصة بك\n• إنشاء توصيات الوظائف\n• تحسين جودة السيرة الذاتية الخاصة بك\n\nنحن لا:\n• نستخدم بياناتك لتدريب نماذج الذكاء الاصطناعي الخارجية\n• نشارك بياناتك مع مزودي الذكاء الاصطناعي بدون موافقة\n• ننشئ ملفات شخصية للبيع أو التسويق\n• نبيع بياناتك لمتخصصي التوظيف أو الشركات'
        }
      ]
    }
  };

  const currentContent = isRTL ? content.ar : content.en;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentContent.title}</h1>
        <p className="text-gray-600 mb-12">{currentContent.lastUpdated}</p>
        
        <div className="space-y-8">
          {currentContent.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            {isRTL ? 'تواصل معنا' : 'Contact Us'}
          </h3>
          <p className="text-blue-900">
            {isRTL
              ? 'لأي استفسارات بشأن سياسة الخصوصية أو لممارسة حقوقك:'
              : 'For any inquiries about this Privacy Policy or to exercise your rights:'}
          </p>
          <p className="text-blue-900 mt-2 font-semibold">privacy@cvin.com</p>
        </div>
      </div>
    </div>
  );
}
