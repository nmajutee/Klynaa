import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Input variant configurations
const inputVariants = cva(
  'flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder:text-neutral-500 dark:text-neutral-100 dark:focus:ring-primary-400 dark:focus:border-primary-400',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-error-300 focus:border-error-500 focus:ring-error-500 dark:border-error-600 dark:focus:border-error-400 dark:focus:ring-error-400',
        success: 'border-success-300 focus:border-success-500 focus:ring-success-500 dark:border-success-600 dark:focus:border-success-400 dark:focus:ring-success-400',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Input Component
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: finalVariant, size }),
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              {leftIcon}
            </div>
          )}
          {inputElement}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

// TextArea Component
export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  helperText?: string;
  resize?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant, size, error, helperText, resize = true, ...props }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <textarea
        className={cn(
          inputVariants({ variant: finalVariant, size }),
          'min-h-[80px]',
          !resize && 'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

// Label Component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none text-neutral-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-neutral-300',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1 dark:text-error-400">*</span>}
    </label>
  )
);

Label.displayName = 'Label';

// Field Component (combines Label, Input/TextArea, and error/helper text)
export interface FieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  helperText,
  required,
  children,
  className,
}) => {
  // Cast children to have props property for type safety
  const childWithProps = children as React.ReactElement<any>;
  const id = childWithProps.props?.id || childWithProps.props?.name;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {React.cloneElement(childWithProps, { error, id })}
      {(error || helperText) && (
        <p className={cn('text-xs', error ? 'text-error-600' : 'text-neutral-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Select Component
export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, error, options, placeholder, ...props }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <select
        className={cn(
          inputVariants({ variant: finalVariant, size }),
          'cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")] bg-[position:right_8px_center] bg-[size:16px] pr-8',
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

// Checkbox Component
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={cn(
              'h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              hasError && 'border-error-300 focus:ring-error-500',
              className
            )}
            {...props}
          />
          {label && (
            <Label htmlFor={checkboxId} className="text-sm font-normal cursor-pointer">
              {label}
            </Label>
          )}
        </div>
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-error-600' : 'text-neutral-500')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio Component
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          ref={ref}
          id={radioId}
          className={cn(
            'h-4 w-4 border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            hasError && 'border-error-300 focus:ring-error-500',
            className
          )}
          {...props}
        />
        {label && (
          <Label htmlFor={radioId} className="text-sm font-normal cursor-pointer">
            {label}
          </Label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// Radio Group Component
export interface RadioGroupProps {
  name: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  error,
  helperText,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-2">
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            disabled={option.disabled}
            error={error}
          />
        ))}
      </div>
      {(error || helperText) && (
        <p className={cn('text-xs', error ? 'text-error-600' : 'text-neutral-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;