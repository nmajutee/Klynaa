import React from 'react';
import { useTheme } from '../../contexts/SimpleThemeContext';
import { Icon } from '../../../components/ui/Icons';

export default function WorkingThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔥 WORKING THEME TOGGLE CLICKED!');
    console.log('🔥 Current theme before toggle:', theme);
    console.log('🔥 HTML classes before:', document.documentElement.className);
    console.log('🔥 Has dark class before:', document.documentElement.classList.contains('dark'));

    try {
      toggleTheme();
      console.log('🔥 Toggle function called successfully');

      // Check state after toggle
      setTimeout(() => {
        console.log('🔥 HTML classes after:', document.documentElement.className);
        console.log('🔥 Has dark class after:', document.documentElement.classList.contains('dark'));
      }, 100);
    } catch (error) {
      console.error('🔥 Error in toggle function:', error);
    }
  };

  console.log('🔥 WorkingThemeToggle render - theme:', theme);

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ease-in-out hover:scale-105 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Icon
        name={theme === 'dark' ? 'Sun' : 'Moon'}
        className="w-5 h-5 text-gray-700 dark:text-gray-200"
      />
    </button>
  );
}