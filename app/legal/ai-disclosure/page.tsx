'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function AIDisclosure() {
  const { isRTL } = useLanguage();

  const content = {
    en: {
      title: 'AI Usage Disclosure',
      subtitle: 'How We Use Artificial Intelligence Safely & Responsibly',
      sections: [
        {
          heading: '🤖 What AI Does on CVin',
          points: [
            'Generates professional CV content based on information you provide',
            'Creates compelling professional summaries',
            'Suggests relevant skills aligned with your field of study and target role',
            'Enhances job responsibilities with professional language',
            'Improves text clarity and ATS compatibility',
            'Generates job-matching recommendations'
          ]
        },
        {
          heading: '✅ What AI DOES NOT Do',
          points: [
            'Invent or fabricate any data you did not provide',
            'Assume education, degree level, or specialization',
            'Create false job history or experience',
            'Generate false achievements or metrics',
            'Add information not explicitly provided by you',
            'Use your data to train external AI models',
            'Share your personal information with third parties without consent'
          ]
        },
        {
          heading: '🔒 Data Protection in AI Processing',
          points: [
            'Your personal data is used ONLY for generating your own CV content',
            'Data is NOT used to train or improve external AI models',
            'Data Processing Agreements with AI providers ensure compliance',
            'Your data is stored encrypted and securely',
            'No cross-border data transfer without your consent',
            'You maintain full control over your data'
          ]
        },
        {
          heading: '⚠️ Important Disclaimers',
          points: [
            'AI-generated content is a starting point - YOU must review it',
            'Accuracy depends on the quality of information YOU provide',
            'CVin is not responsible for errors in AI-generated content you don\'t correct',
            'Always verify facts, dates, and achievements before submitting',
            'Test your CV with employers or recruiters before final submission',
            'AI cannot assess the truthfulness of information you provide'
          ]
        },
        {
          heading: '🎯 How AI Quality Improves',
          points: [
            'By providing complete, accurate information in your profile',
            'By specifying your degree level and education specialization',
            'By clearly describing your career level and target domain',
            'By providing detailed job descriptions and responsibilities',
            'By reviewing and correcting AI suggestions',
            'By using specific examples from your real experience'
          ]
        },
        {
          heading: '👤 Your Profile Information Usage',
          points: [
            'Degree Level - Tailors tone and complexity to your education',
            'Education Specialization - Aligns skills with your field of study',
            'Career Level - Adjusts responsibility scope and language',
            'Years of Experience - Ensures realistic expectations',
            'Target Domain - Generates relevant skills and content',
            'Strengths & Interests - Personalizes recommendations'
          ]
        },
        {
          heading: '📋 Your Rights & Control',
          points: [
            'You can revise any AI-generated content',
            'You can reject AI suggestions and write your own',
            'You can request regeneration with different parameters',
            'You can delete your data anytime',
            'You can withdraw consent for AI processing',
            'You can export your data in portable format'
          ]
        },
        {
          heading: '✋ What Happens If AI Makes a Mistake',
          points: [
            'You are responsible for reviewing content accuracy',
            'Correct any errors before finalizing your CV',
            'Report systematic AI issues to us at support@cvin.com',
            'CVin is not liable for consequences of unverified AI content',
            'Always take responsibility for accuracy of your CV'
          ]
        },
        {
          heading: '🌍 Compliance & Standards',
          points: [
            'Compliant with Saudi Arabia\'s Personal Data Protection Law (PDPL)',
            'Follows SDAIA (Saudi Data and AI Authority) guidelines',
            'Adheres to HR-tech industry standards',
            'Regular security audits and compliance reviews',
            'Transparent data handling practices',
            'Respects user privacy and data ownership'
          ]
        }
      ]
    },
    ar: {
      title: 'الإفصاح عن استخدام الذكاء الاصطناعي',
      subtitle: 'كيف نستخدم الذكاء الاصطناعي بأمان ومسؤولية',
      sections: [
        {
          heading: 'ما يفعله الذكاء الاصطناعي على CVin',
          points: [
            'إنشاء محتوى السيرة الذاتية المهنية بناءً على المعلومات التي تقدمها',
            'إنشاء ملخصات مهنية مقنعة',
            'اقتراح مهارات ذات صلة متوافقة مع مجال دراستك والدور المستهدف',
            'تحسين مسؤوليات الوظيفة باللغة الاحترافية',
            'تحسين وضوح النص والتوافق مع نظام تقييم الطلبات',
            'إنشاء توصيات تطابق الوظائف'
          ]
        },
        {
          heading: 'ما لا يفعله الذكاء الاصطناعي',
          points: [
            'اختراع أو تصنيع أي بيانات لم تقدمها',
            'افتراض المستوى التعليمي أو مستوى الدرجة العلمية أو التخصص',
            'إنشاء سجل وظائف كاذب أو تجربة',
            'إنشاء إنجازات أو مقاييس كاذبة',
            'إضافة معلومات لم تقدمها صراحة',
            'استخدام بياناتك لتدريب نماذج الذكاء الاصطناعي الخارجية',
            'مشاركة معلوماتك الشخصية مع أطراف ثالثة بدون موافقة'
          ]
        },
        {
          heading: 'حماية البيانات في معالجة الذكاء الاصطناعي',
          points: [
            'يتم استخدام بياناتك الشخصية فقط لإنشاء محتوى السيرة الذاتية الخاصة بك',
            'البيانات ليست لتدريب أو تحسين نماذج الذكاء الاصطناعي الخارجية',
            'اتفاقيات معالجة البيانات مع مزودي الذكاء الاصطناعي تضمن الامتثال',
            'يتم تخزين بياناتك مشفرة وآمنة',
            'لا نقل البيانات عبر الحدود بدون موافقتك',
            'تحافظ على السيطرة الكاملة على بياناتك'
          ]
        }
      ]
    }
  };

  const currentContent = isRTL ? content.ar : content.en;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentContent.title}</h1>
          <p className="text-xl text-gray-600">{currentContent.subtitle}</p>
        </div>
        
        <div className="space-y-12">
          {currentContent.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.heading}</h2>
              <ul className="space-y-4">
                {section.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold text-lg mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">
            {isRTL ? '🔒 استئمانك علينا' : '🔒 Your Trust Matters to Us'}
          </h3>
          <p className="text-lg leading-relaxed">
            {isRTL
              ? 'نحن ملتزمون بالشفافية الكاملة حول كيفية استخدامنا للذكاء الاصطناعي. سياستنا تركز على سلامتك وخصوصيتك وملكيتك الكاملة لبياناتك. إذا كانت لديك أي أسئلة حول معالجة الذكاء الاصطناعي، يرجى التواصل معنا.'
              : 'We are committed to full transparency about how we use AI. Our policy prioritizes your safety, privacy, and complete ownership of your data. If you have any questions about AI processing, please contact us.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
