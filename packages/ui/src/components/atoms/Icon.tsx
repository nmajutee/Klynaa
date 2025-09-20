import React from 'react';
import { cn } from '../../utils/cn';

export interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Simple emoji icons for now - can be replaced with a proper icon library
  const icons: Record<string, string> = {
    bin: '🗑️',
    pickup: '🚚',
    worker: '👷',
    analytics: '📈',
    location: '📍',
    check: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    user: '👤',
    settings: '⚙️',
    search: '🔍',
    menu: '☰',
    close: '✕',
    add: '➕',
    edit: '✏️',
    delete: '🗑️'
  };

  return (
    <span
      className={cn('inline-block text-center', sizes[size], className)}
      role="img"
      aria-label={name}
    >
      {icons[name] || '❓'}
    </span>
  );
};