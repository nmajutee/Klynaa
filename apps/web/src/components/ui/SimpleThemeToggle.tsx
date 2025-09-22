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
    <div>
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
          color: theme === 'dark' ? '#f3f4f6' : '#374151',
          border: '1px solid',
          borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'dark' ? (
          <Icon name="Sun" size={16 as any} />
        ) : (
          <Icon name="Moon" size={16 as any} />
        )}
      </button>
    </div>
  );
}