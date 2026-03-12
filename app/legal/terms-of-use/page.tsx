'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function TermsOfUse() {
  const { isRTL } = useLanguage();

  const content = {
    en: {
      title: 'Terms of Use',
      lastUpdated: 'Last Updated: November 2024',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          content: 'By accessing and using CVin ("Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        {
          heading: '2. Use License',
          content: 'Permission is granted to temporarily download one copy of the materials (information or software) on CVin for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n• Modify or copy the materials\n• Use the materials for any commercial purpose or for any public display\n• Attempt to decompile or reverse engineer any software contained on the Platform\n• Remove any copyright or other proprietary notations from the materials\n• Transfer the materials to another person or "mirror" the materials on any other server'
        },
        {
          heading: '3. Disclaimer',
          content: 'The materials on CVin are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
        },
        {
          heading: '4. Limitations of Liability',
          content: 'In no event shall CVin or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CVin, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.'
        },
        {
          heading: '5. Accuracy of Materials',
          content: 'The materials appearing on CVin could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our Platform are accurate, complete, or current. We may make changes to the materials contained on our Platform at any time without notice.'
        },
        {
          heading: '6. Materials on CVin',
          content: 'We have not reviewed all of the sites linked to our Platform and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user\'s own risk.'
        },
        {
          heading: '7. Modifications',
          content: 'We may revise these terms of service for our Platform at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these terms of service.'
        },
        {
          heading: '8. Governing Law & Jurisdiction',
          content: 'These terms and conditions are governed by and construed in accordance with the laws of Saudi Arabia, and you irrevocably submit to the exclusive jurisdiction of the courts in Saudi Arabia.'
        },
        {
          heading: '9. User Responsibility',
          content: 'You are responsible for:\n• Ensuring the accuracy of all information you provide\n• Maintaining the confidentiality of your account credentials\n• Ensuring that you own or have rights to all documents you upload\n• Reviewing AI-generated content and making corrections as needed\n• Complying with all applicable laws and regulations'
        },
        {
          heading: '10. Prohibited Use',
          content: 'You may not use CVin to:\n• Upload false, misleading, or illegal documents\n• Engage in unauthorized access or system interference\n• Transmit viruses or malware\n• Engage in discrimination or harassment\n• Violate intellectual property rights\n• Engage in any unlawful activity'
        },
        {
          heading: '11. AI-Generated Content Disclaimer',
          content: 'AI-generated CV content is based solely on information you provide. We:\n• Do NOT fabricate or invent data you did not provide\n• Do NOT guarantee the accuracy of AI-generated content\n• Recommend that you review all AI-generated content before submitting\n• Are not liable for consequences of using unverified or inaccurate AI-generated content'
        },
        {
          heading: '12. Intellectual Property Rights',
          content: 'The Platform and all content (including but not limited to text, graphics, logos, images) are the property of CVin or our content suppliers and are protected by international copyright laws. You may not reproduce, distribute, or transmit any content without our prior written permission.'
        },
        {
          heading: '13. Termination',
          content: 'We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms. Upon termination, your right to use the Platform will immediately cease.'
        },
        {
          heading: '14. Dispute Resolution',
          content: 'Any dispute arising from your use of CVin shall be resolved through:\n• Good faith negotiation\n• If unresolved within 30 days, through arbitration in accordance with Saudi Arabia\'s laws\n• Both parties agree to submit to arbitration rather than court proceedings'
        }
      ]
    },
    ar: {
      title: 'شروط الاستخدام',
      lastUpdated: 'آخر تحديث: نوفمبر 2024',
      sections: [
        {
          heading: 'قبول الشروط',
          content: 'بالوصول واستخدام CVin ("المنصة")، فإنك توافق على الالتزام بشروط وأحكام هذه الاتفاقية. إذا كنت لا توافق على الالتزام بما ورد أعلاه، يرجى عدم استخدام هذه الخدمة.'
        },
        {
          heading: 'ترخيص الاستخدام',
          content: 'يُمنح الإذن بتنزيل نسخة واحدة مؤقتة من المواد (المعلومات أو البرنامج) على CVin للعرض الشخصي والمؤقت فقط. هذا منح الترخيص، وليس نقل الملكية، وبموجب هذا الترخيص قد لا:\n• تعديل أو نسخ المواد\n• استخدام المواد لأي غرض تجاري أو لأي عرض عام\n• محاولة فك تجميع أو الهندسة العكسية لأي برنامج على المنصة\n• إزالة أي حقوق طبع ونشر أو إشعارات ملكية أخرى من المواد\n• نقل المواد إلى شخص آخر أو "نسخ" المواد على أي خادم آخر'
        },
        {
          heading: 'إخلاء المسؤولية',
          content: 'المواد على CVin يتم توفيرها "كما هي". نحن لا نقدم أي ضمانات، معبر عنها أو ضمنية، وبموجب هذا ننسخ ونلغي جميع الضمانات الأخرى بما في ذلك، على سبيل المثال لا الحصر، الضمانات الضمنية أو شروط التسويق، الملاءمة لغرض معين، أو عدم انتهاك الملكية الفكرية أو حقوق أخرى.'
        },
        {
          heading: 'تحديد المسؤولية',
          content: 'في أي حال من الأحوال، لن تكون CVin أو موردونا مسؤولين عن أي أضرار (بما في ذلك، على سبيل المثال لا الحصر، الأضرار الناجمة عن فقدان البيانات أو الأرباح، أو بسبب انقطاع الأعمال) الناشئة عن استخدام أو عدم القدرة على استخدام المواد على CVin، حتى إذا تم إخطارنا أو ممثل مفوض شفهياً أو كتابياً عن احتمالية حدوث مثل هذا الضرر.'
        },
        {
          heading: 'دقة المواد',
          content: 'قد تحتوي المواد المعروضة على CVin على أخطاء تقنية أو طباعية أو فوتوغرافية. نحن لا نضمن أن أي من المواد على منصتنا دقيقة أو كاملة أو حالية. قد نجري تغييرات على المواد الموجودة على منصتنا في أي وقت بدون إخطار.'
        },
        {
          heading: 'المواد على CVin',
          content: 'لم نقم بمراجعة جميع المواقع المرتبطة بمنصتنا وليسنا مسؤولين عن محتويات أي موقع مرتبط بهذا الشكل. إن إدراج أي رابط لا يعني مصادقتنا على الموقع. استخدام أي موقع ويب مرتبط بهذا الشكل يتم على مسؤولية المستخدم.'
        },
        {
          heading: 'التعديلات',
          content: 'قد نعدل شروط الخدمة لمنصتنا في أي وقت بدون إخطار. باستخدام هذه المنصة، فإنك توافق على الالتزام بالإصدار الحالي من شروط الخدمة هذه.'
        },
        {
          heading: 'القانون الحاكم والاختصاص',
          content: 'تحكم هذه الشروط والأحكام ويتم تفسيرها وفقاً لقوانين المملكة العربية السعودية، وأنت توافق بشكل لا رجعة فيه على الاختصاص الحصري لمحاكم المملكة العربية السعودية.'
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
      </div>
    </div>
  );
}
