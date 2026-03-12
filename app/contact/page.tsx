'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiMail, FiMapPin, FiClock, FiSend, FiCheckCircle, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';

export default function ContactPage() {
  const { isRTL } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      setResult({ type: 'error', text: isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setResult({ type: 'error', text: isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address' });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      await axios.post('/api/contact', formData);
      setResult({ type: 'success', text: isRTL ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : 'Your message has been sent successfully! We\'ll get back to you soon.' });
      setFormData({ fullName: '', email: '', subject: '', message: '' });
    } catch {
      setResult({ type: 'error', text: isRTL ? 'فشل إرسال الرسالة. حاول مرة أخرى.' : 'Failed to send message. Please try again.' });
    } finally { setSending(false); }
  };

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all duration-200';
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  const subjects = isRTL
    ? [{ value: 'general', label: 'استفسار عام' }, { value: 'support', label: 'دعم فني' }, { value: 'billing', label: 'الفوترة' }, { value: 'feedback', label: 'ملاحظات' }, { value: 'partnership', label: 'شراكة' }]
    : [{ value: 'general', label: 'General Inquiry' }, { value: 'support', label: 'Technical Support' }, { value: 'billing', label: 'Billing' }, { value: 'feedback', label: 'Feedback' }, { value: 'partnership', label: 'Partnership' }];

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500 rounded-full filter blur-[200px] opacity-[0.07]" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-cyan-500 rounded-full filter blur-[180px] opacity-[0.06]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative z-10 text-center" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-full mb-6">
            <FiMessageSquare className="w-4 h-4 text-accent-400" />
            <span className="text-sm text-white/60 font-medium">{isRTL ? 'تواصل معنا' : 'Get in touch'}</span>
          </div>
          <h1 className="font-telegraf text-4xl sm:text-5xl font-extrabold text-white mb-4">{isRTL ? 'تواصل معنا' : 'Contact Us'}</h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">{isRTL ? 'نحن هنا لمساعدتك. لا تتردد في التواصل معنا.' : 'We\'re here to help. Don\'t hesitate to reach out.'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: 'all 0.6s ease 0.1s' }}>
            {[
              { icon: FiMail, color: 'bg-blue-50 text-blue-600', title: isRTL ? 'البريد الإلكتروني' : 'Email', value: 'support@cvin.sa', sub: isRTL ? 'أرسل لنا في أي وقت' : 'Write to us anytime' },
              { icon: FiMapPin, color: 'bg-accent-50 text-accent-600', title: isRTL ? 'الموقع' : 'Location', value: isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia', sub: isRTL ? 'مقرنا الرئيسي' : 'Our headquarters' },
              { icon: FiClock, color: 'bg-purple-50 text-purple-600', title: isRTL ? 'وقت الاستجابة' : 'Response Time', value: isRTL ? 'خلال 24-48 ساعة' : 'Within 24-48 hours', sub: isRTL ? 'أيام العمل' : 'Business days' },
            ].map((info, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${info.color} flex-shrink-0`}>
                  <info.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{info.title}</p>
                  <p className="text-sm font-bold text-navy-900 mt-0.5">{info.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{info.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: 'all 0.6s ease 0.2s' }}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-50">
                  <FiSend className="w-4.5 h-4.5 text-accent-600" />
                </div>
                <div>
                  <h2 className="font-telegraf font-bold text-navy-900">{isRTL ? 'أرسل رسالة' : 'Send a Message'}</h2>
                  <p className="text-xs text-gray-400">{isRTL ? 'سنرد عليك في أقرب وقت' : 'We\'ll get back to you shortly'}</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {result && (
                  <div className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${result.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {result.type === 'success' ? <FiCheckCircle className="w-4 h-4 flex-shrink-0" /> : <FiAlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {result.text}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputCls} placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'} />
                  </div>
                  <div>
                    <label className={labelCls}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{isRTL ? 'الموضوع' : 'Subject'}</label>
                  <select name="subject" value={formData.subject} onChange={handleChange} className={`${inputCls} appearance-none`}>
                    <option value="">{isRTL ? 'اختر الموضوع' : 'Select a subject'}</option>
                    {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{isRTL ? 'الرسالة' : 'Message'}</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={5} className={inputCls} placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'} />
                </div>
                <button type="submit" disabled={sending} className="w-full py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {sending ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : (isRTL ? 'إرسال الرسالة' : 'Send Message')}
                  {!sending && <FiSend className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
