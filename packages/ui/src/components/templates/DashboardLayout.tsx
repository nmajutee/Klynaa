import React from 'react';
import { cn } from '../../utils/cn';
import { Header } from '../organisms/Header';
import { Sidebar } from '../organisms/Sidebar';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  sidebarWidth?: 'sm' | 'md' | 'lg';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  header,
  sidebar,
  className,
  sidebarWidth = 'md'
}) => {
  const sidebarWidthClasses = {
    sm: 'ml-48',
    md: 'ml-64',
    lg: 'ml-80'
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {header && (
        <Header>
          {header}
        </Header>
      )}

      {sidebar && (
        <Sidebar width={sidebarWidth}>
          {sidebar}
        </Sidebar>
      )}

      <main className={cn(
        'p-6',
        sidebar && sidebarWidthClasses[sidebarWidth],
        header && 'pt-20'
      )}>
        {children}
      </main>
    </div>
  );
};