import React from 'react';
import { cn } from '../../utils/cn';

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  width?: 'sm' | 'md' | 'lg';
  position?: 'left' | 'right';
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className,
  width = 'md',
  position = 'left'
}) => {
  const widthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80'
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  return (
    <aside className={cn(
      'fixed top-0 h-full bg-white border-r border-gray-200 z-30',
      widthClasses[width],
      positionClasses[position],
      className
    )}>
      <div className="h-full overflow-y-auto p-4">
        {children}
      </div>
    </aside>
  );
};