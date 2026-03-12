'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiZap, FiEdit3, FiCpu, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

interface ChatMessage {
  type: 'user' | 'ai' | 'skills';
  text: string;
  displayedText: string;
  isTyping: boolean;
  isComplete: boolean;
  skills?: string[];
  visibleSkills?: number;
}

function AITypingPanel({ isRTL }: { isRTL: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const promptText = isRTL
    ? 'اكتب لي ملخص احترافي لمهندس برمجيات'
    : 'Write me a professional summary for a software engineer';

  const aiResponseText = isRTL
    ? 'مهندس برمجيات متمرس يتمتع بخبرة تزيد عن 5 سنوات في تطوير تطبيقات ويب وموبايل قابلة للتوسع. متخصص في بناء حلول عالية الأداء باستخدام أحدث التقنيات...'
    : 'Accomplished software engineer with 5+ years of experience building scalable web and mobile applications. Specialized in creating high-performance solutions using cutting-edge technologies...';

  const optimizePrompt = isRTL
    ? 'حسّن قسم المهارات ليتوافق مع ATS'
    : 'Optimize skills section for ATS compatibility';

  const skills = ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'SQL'];

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(c => !c);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const typeText = (text: string, speed: number): Promise<void> => {
      return new Promise((resolve) => {
        let idx = 0;
        const type = () => {
          if (cancelled) return;
          if (idx <= text.length) {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last) {
                updated[updated.length - 1] = { ...last, displayedText: text.slice(0, idx), isTyping: idx < text.length };
              }
              return updated;
            });
            idx++;
            timeoutRef.current = setTimeout(type, speed + Math.random() * 25);
          } else {
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last) {
                updated[updated.length - 1] = { ...last, isComplete: true, isTyping: false };
              }
              return updated;
            });
            resolve();
          }
        };
        type();
      });
    };

    const wait = (ms: number): Promise<void> => new Promise(r => { timeoutRef.current = setTimeout(r, ms); });

    const showSkillsOneByOne = (): Promise<void> => {
      return new Promise((resolve) => {
        let idx = 0;
        intervalRef.current = setInterval(() => {
          if (cancelled) return;
          idx++;
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last) {
              updated[updated.length - 1] = { ...last, visibleSkills: idx };
            }
            return updated;
          });
          if (idx >= skills.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last) {
                updated[updated.length - 1] = { ...last, isComplete: true, isTyping: false };
              }
              return updated;
            });
            resolve();
          }
        }, 400);
      });
    };

    const runSequence = async () => {
      while (!cancelled) {
        setMessages([]);
        await wait(600);
        if (cancelled) break;

        setMessages([{ type: 'user', text: promptText, displayedText: '', isTyping: true, isComplete: false }]);
        await typeText(promptText, 35);
        if (cancelled) break;
        await wait(800);
        if (cancelled) break;

        setMessages(prev => [...prev, { type: 'ai', text: aiResponseText, displayedText: '', isTyping: true, isComplete: false }]);
        await typeText(aiResponseText, 20);
        if (cancelled) break;
        await wait(1200);
        if (cancelled) break;

        setMessages(prev => [...prev, { type: 'user', text: optimizePrompt, displayedText: '', isTyping: true, isComplete: false }]);
        await typeText(optimizePrompt, 35);
        if (cancelled) break;
        await wait(600);
        if (cancelled) break;

        setMessages(prev => [...prev, { type: 'skills', text: '', displayedText: '', isTyping: true, isComplete: false, skills, visibleSkills: 0 }]);
        await showSkillsOneByOne();
        if (cancelled) break;

        await wait(5000);
      }
    };

    runSequence();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRTL]);

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-accent-500/5 rounded-[2rem] blur-xl"></div>

      <div className="relative bg-navy-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-5 md:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          <span className="text-[11px] text-white/30 ml-2">{isRTL ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant'}</span>
        </div>

        <div className="space-y-3 min-h-[280px]">
          {messages.map((msg, i) => {
            if (msg.type === 'user') {
              return (
                <div key={i} className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-4 py-2.5">
                    <p className="text-sm text-white/70" dir={isRTL ? 'rtl' : 'ltr'}>
                      {msg.displayedText}
                      {msg.isTyping && <span className={`inline-block w-0.5 h-4 bg-white/60 ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>}
                    </p>
                  </div>
                </div>
              );
            }

            if (msg.type === 'ai') {
              return (
                <div key={i} className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[85%] bg-gradient-to-br from-accent-500/20 to-accent-600/10 border border-accent-500/20 rounded-2xl rounded-tr-md px-4 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FiZap className="w-3 h-3 text-accent-400" />
                      <span className="text-[10px] text-accent-400 font-semibold">{isRTL ? 'ذكاء اصطناعي' : 'AI Generated'}</span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                      {msg.displayedText}
                      {msg.isTyping && <span className={`inline-block w-0.5 h-4 bg-accent-400/80 ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>}
                    </p>
                  </div>
                </div>
              );
            }

            if (msg.type === 'skills') {
              return (
                <div key={i} className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[85%] bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 rounded-2xl rounded-tr-md px-4 py-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FiCheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-green-400 font-semibold">{isRTL ? 'تم التحسين' : 'Optimized'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(msg.skills || []).map((skill, j) => (
                        <span
                          key={j}
                          className={`px-2.5 py-1 bg-white/10 rounded-lg text-xs text-white/70 border border-white/5 transition-all duration-500 ${
                            j < (msg.visibleSkills || 0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-[11px] text-white/40">{isRTL ? 'الذكاء الاصطناعي جاهز للمساعدة...' : 'AI ready to help...'}</span>
        </div>
      </div>

      <div className="absolute -top-3 -right-3 w-16 h-16 bg-accent-500/20 rounded-2xl rotate-12 blur-xl"></div>
      <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-blue-500/20 rounded-2xl -rotate-12 blur-xl"></div>
    </div>
  );
}

export default function AISection() {
  const { t, isRTL } = useLanguage();

  const capabilities = [
    {
      icon: FiEdit3,
      title: isRTL ? 'كتابة ذكية للمحتوى' : 'Smart Content Writing',
      desc: isRTL ? 'يقوم الذكاء الاصطناعي بكتابة ملخصات ووصف خبرات احترافية' : 'AI writes professional summaries and experience descriptions',
    },
    {
      icon: FiCpu,
      title: isRTL ? 'تحسين تلقائي للتنسيق' : 'Auto Format Optimization',
      desc: isRTL ? 'تنسيق ذكي يتوافق مع أنظمة تتبع المتقدمين' : 'Smart formatting that passes ATS screening systems',
    },
    {
      icon: FiCheckCircle,
      title: isRTL ? 'اقتراحات مهارات ذكية' : 'Intelligent Skill Suggestions',
      desc: isRTL ? 'يقترح المهارات المناسبة بناءً على مجال عملك' : 'Suggests relevant skills based on your industry',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-[15%] w-80 h-80 bg-accent-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-[15%] w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 text-accent-400 rounded-full text-sm font-semibold mb-6">
              <FiZap className="w-4 h-4" />
              {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
            </div>

            <h2 className="font-telegraf text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {isRTL ? (
                <>
                  دع الذكاء الاصطناعي
                  <span className="block bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                    يبني سيرتك الذاتية
                  </span>
                </>
              ) : (
                <>
                  Let AI Build Your
                  <span className="block bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                    Perfect Resume
                  </span>
                </>
              )}
            </h2>

            <p className="text-lg text-white/60 mb-8 leading-relaxed">
              {isRTL
                ? 'تقنية الذكاء الاصطناعي المتقدمة تحلل مجال عملك وتكتب محتوى احترافي يلفت انتباه أصحاب العمل ويتجاوز أنظمة الفرز الآلي.'
                : 'Advanced AI technology analyzes your field and writes professional content that catches employers\' attention and passes automated screening systems.'}
            </p>

            <div className="space-y-5 mb-10">
              {capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-500/20 group-hover:border-accent-500/30 transition-all duration-300">
                    <cap.icon className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{cap.title}</h4>
                    <p className="text-sm text-white/50">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/template-gallery">
              <button className="group px-8 py-4 bg-accent-500 text-white rounded-xl font-bold text-base shadow-lg shadow-accent-500/30 hover:bg-accent-400 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                {isRTL ? 'جرّب الآن مجاناً' : 'Try It Free Now'}
                <FiArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </button>
            </Link>
          </div>

          <AITypingPanel isRTL={isRTL} />
        </div>
      </div>
    </section>
  );
}
