'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiMenu, FiX, FiArrowRight } from 'react-icons/fi';

export default function Navigation() {
  const { t, isHydrated, isRTL } = useLanguage();
  const { user, logout, loading: authLoading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isHydrated || authLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img src="/brand/logo-dark.png" alt="CVin" className="h-9 sm:h-10 w-auto object-contain" />
            </Link>
            <div className="w-32 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  const profilePhoto = (user as any)?.profilePicture;
  const userName = user?.fullName || user?.username || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/#features', label: t.nav.features },
    { href: '/#pricing', label: t.nav.pricing },
    { href: '/career-tips', label: t.nav.careerTips },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-navy-900/5 border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-xl border-b border-gray-100/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/brand/logo-dark.png" alt="CVin" className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, i) => (
                <Link key={i} href={link.href}
                  className="px-4 py-2 font-medium text-sm text-navy-700 hover:text-accent-600 rounded-lg hover:bg-accent-50/50 transition-all duration-200">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-navy-50 transition-all duration-200 border border-gray-200"
                  >
                    {profilePhoto ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-accent-200">
                        <img src={profilePhoto} alt={userName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white font-semibold text-sm">
                        {userInitial}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-navy-900 max-w-[100px] truncate">
                      {userName}
                    </span>
                    <FiChevronDown className={`w-4 h-4 text-navy-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileMenu && (
                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 nav-dropdown`}>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {profilePhoto ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-accent-200">
                              <img src={profilePhoto} alt={userName} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white font-semibold">
                              {userInitial}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-navy-900 truncate">{userName}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link href="/dashboard" onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-accent-50 hover:text-accent-600 transition-all duration-200 rounded-lg mx-2">
                          <FiUser className="w-4 h-4" />
                          {t.nav.dashboard}
                        </Link>
                        <Link href="/settings" onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-accent-50 hover:text-accent-600 transition-all duration-200 rounded-lg mx-2">
                          <FiSettings className="w-4 h-4" />
                          {isRTL ? 'الملف الشخصي والإعدادات' : 'Profile & Settings'}
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1 mt-1 px-2">
                        <button onClick={() => { setShowProfileMenu(false); logout(); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all duration-200 rounded-lg">
                          <FiLogOut className="w-4 h-4" />
                          {t.nav.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/auth/login">
                    <button className="px-5 py-2 text-sm font-medium text-navy-700 hover:text-accent-600 rounded-lg hover:bg-accent-50/50 transition-all duration-200">
                      {t.nav.login}
                    </button>
                  </Link>
                  <Link href="/template-gallery">
                    <button className="group px-5 py-2.5 text-sm font-semibold bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-all duration-300 shadow-sm shadow-accent-500/20 flex items-center gap-1.5">
                      {t.hero.cta}
                      <FiArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-navy-700 hover:bg-navy-50 rounded-xl transition-all duration-200"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <span className={`absolute w-5 h-0.5 bg-navy-800 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
                  <span className={`absolute w-5 h-0.5 bg-navy-800 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`absolute w-5 h-0.5 bg-navy-800 rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-6 pt-2 space-y-1 border-t border-gray-100 bg-white">
            {navLinks.map((link, i) => (
              <Link key={i} href={link.href} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 font-medium text-navy-700 hover:text-accent-600 hover:bg-accent-50/50 rounded-xl transition-all duration-200">
                {link.label}
              </Link>
            ))}

            {!user && (
              <div className="pt-4 space-y-2.5 border-t border-gray-100 mt-2">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <button className="w-full px-4 py-3 text-sm font-medium border border-gray-200 text-navy-700 hover:border-accent-300 rounded-xl transition-all duration-200">
                    {t.nav.login}
                  </button>
                </Link>
                <Link href="/template-gallery" onClick={() => setMobileMenuOpen(false)} className="block">
                  <button className="w-full px-4 py-3 text-sm font-semibold bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-sm">
                    {t.hero.cta}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nav-dropdown { animation: dropdownIn 0.2s ease-out; }
      `}</style>
    </>
  );
}
