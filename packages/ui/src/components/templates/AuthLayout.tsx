import React from 'react';
import { cn } from '../../utils/cn';
import { Card } from '../atoms/Card';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  className
}) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8',
      className
    )}>
      <div className="max-w-md w-full space-y-8">
        {(title || subtitle) && (
          <div className="text-center">
            {title && (
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <Card padding="lg">
          {children}
        </Card>
      </div>
    </div>
  );
};