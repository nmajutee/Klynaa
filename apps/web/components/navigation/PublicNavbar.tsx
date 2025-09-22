import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '../../components/ui/Icons';
import { useLanguage } from '../../src/contexts/LanguageContext';
import ThemeToggle from '../../src/components/ui/ThemeToggle';

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: t('nav.home', 'Home'), href: '/', current: router.pathname === '/' },
    { name: t('nav.features', 'Features'), href: '/features', current: router.pathname === '/features' },
    { name: t('nav.about', 'About'), href: '/about', current: router.pathname === '/about' },
    { name: t('nav.contact', 'Contact'), href: '/contact', current: router.pathname === '/contact' },
  ];

  // Don't show auth buttons on auth pages
  const isAuthPage = router.pathname.startsWith('/auth/');

  return (
    <nav className="bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Icon name="Truck" className="w-8 h-8" />
              <span className="text-xl font-bold text-neutral-900 dark:text-white">Klynaa</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {/* Navigation Links */}
            <div className="flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-neutral-700 hover:text-emerald-600 hover:border-b-2 hover:border-emerald-200'
                  } px-1 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth Buttons */}
              {!isAuthPage && (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {mounted ? t('auth.signin', 'Sign In') : 'Sign In'}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                  >
                    {mounted ? t('auth.getstarted', 'Get Started') : 'Get Started'}
                    <Icon name="ArrowRight" size={16 as any} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-neutral-700 hover:text-emerald-600 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <Icon name="X" size={24 as any} /> : <Icon name="Menu" size={24 as any} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
            {/* Theme Toggle - Mobile */}
            <div className="flex justify-end px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 mb-4">
              <ThemeToggle />
            </div>

            {/* Mobile menu items */}
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-neutral-700 hover:text-emerald-600 hover:bg-neutral-50'
                  } block px-3 py-2 text-base font-medium rounded-lg transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Auth Buttons - Mobile */}
              {!isAuthPage && (
                <div className="pt-4 pb-3 border-t border-neutral-200 space-y-2">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-emerald-600 hover:bg-neutral-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {mounted ? t('auth.signin', 'Sign In') : 'Sign In'}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-base font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {mounted ? t('auth.getstarted', 'Get Started') : 'Get Started'}
                    <Icon name="ArrowRight" size={16 as any} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}