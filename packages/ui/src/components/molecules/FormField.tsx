import React from 'react';
import { cn } from '../../utils/cn';
import { Input, type InputProps } from '../atoms/Input';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label?: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  helperText,
  required,
  className,
  ...inputProps
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium text-gray-700',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      <Input
        id={id}
        className={cn(
          error && 'border-red-500 focus:ring-red-500'
        )}
        {...inputProps}
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};