import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', size = 'md', label, error, ...props }, ref) => {
    const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500';

    const variants = {
      default: 'border-gray-300',
      error: 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
    };

    const sizes = {
      sm: 'text-sm px-3 py-1',
      md: 'px-3 py-2',
      lg: 'text-lg px-4 py-3'
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          className={cn(baseClasses, variants[variant], sizes[size], className)}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';