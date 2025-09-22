import React from 'react';
import { useTheme } from '../../contexts/SimpleThemeContext';

export default function WorkingThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔥 WORKING THEME TOGGLE CLICKED!');
    console.log('🔥 Current theme before toggle:', theme);

    try {
      toggleTheme();
      console.log('🔥 Toggle function called successfully');
    } catch (error) {
      console.error('🔥 Error in toggle function:', error);
    }
  };

  console.log('🔥 WorkingThemeToggle render - theme:', theme);

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
        border: `2px solid ${theme === 'dark' ? '#6b7280' : '#d1d5db'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        fontSize: '16px',
        fontWeight: 'bold'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#e5e7eb';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}