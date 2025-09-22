import React from 'react';
import { Icon } from '../../../components/ui/Icons';
import { useTheme } from '../../contexts/SimpleThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log('ThemeToggle clicked, current theme:', theme);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'dark' ? (
        <Icon name="Sun" className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
      ) : (
        <Icon name="Moon" className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
      )}
    </button>
  );
}