import React, { useState, useEffect } from 'react';
import { useLanguage, Language } from '../../contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid SSR mismatch
  if (!mounted) {
    return (
      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-full px-3 py-2">
        <span className="flex items-center gap-1 text-sm font-medium">
          <span className="text-neutral-900 dark:text-white">EN</span>
          <span className="text-neutral-400 dark:text-neutral-500 mx-1">/</span>
          <span className="text-neutral-500 dark:text-neutral-400">FR</span>
        </span>
      </div>
    );
  }

  const pillBaseClasses = variant === 'dark'
    ? 'bg-neutral-800 border-neutral-600 hover:bg-neutral-700'
    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700';

  return (
    <div
      className={`flex items-center rounded-full px-3 py-2 border cursor-not-allowed opacity-75 ${pillBaseClasses}`}
      title={`Current language: ${language === 'en' ? 'English' : 'Français'} (Auto-detected)`}
    >
      <span className="flex items-center gap-1 text-sm font-medium">
        <span className={language === 'en'
          ? variant === 'dark' ? 'text-white' : 'text-neutral-900 dark:text-white'
          : variant === 'dark' ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
        }>
          EN
        </span>
        <span className={variant === 'dark' ? 'text-neutral-500 mx-1' : 'text-neutral-400 dark:text-neutral-500 mx-1'}>/</span>
        <span className={language === 'fr'
          ? variant === 'dark' ? 'text-white' : 'text-neutral-900 dark:text-white'
          : variant === 'dark' ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
        }>
          FR
        </span>
      </span>
    </div>
  );
}