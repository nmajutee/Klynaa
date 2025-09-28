import React from 'react';
import { Icon } from '../../../components/ui/Icons';
import { useTheme } from '../../contexts/SimpleThemeContext';

export default function SimpleThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('SimpleThemeToggle clicked! Current theme:', theme);
    toggleTheme();
  };

  console.log('SimpleThemeToggle render, theme:', theme);

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ease-in-out hover:scale-105 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 border border-gray-300 dark:border-neutral-600"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Icon
        name={theme === 'dark' ? 'Sun' : 'Moon'}
        className="w-4 h-4 text-gray-700 dark:text-gray-200"
      />
    </button>
  );
}