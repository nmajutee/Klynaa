import React from 'react';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const Header: React.FC<HeaderProps> = ({
  children,
  className,
  variant = 'primary'
}) => {
  const variantClasses = {
    primary: 'bg-white border-b border-gray-200',
    secondary: 'bg-gray-50 border-b border-gray-300'
  };

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full',
      variantClasses[variant],
      className
    )}>
      <div className="container mx-auto px-4 py-4">
        {children}
      </div>
    </header>
  );
};