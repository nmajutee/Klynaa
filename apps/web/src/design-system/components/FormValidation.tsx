import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';
import { Text } from './Typography';

// Form Validation Hook
export interface ValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  email?: boolean | string;
  phone?: boolean | string;
  url?: boolean | string;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
}

export const useFormValidation = (initialValues: Record<string, any>, rules: Record<string, ValidationRule>) => {
  const [fields, setFields] = useState<Record<string, FormField>>(() =>
    Object.keys(initialValues).reduce((acc, name) => ({
      ...acc,
      [name]: {
        name,
        value: initialValues[name],
        error: undefined,
        touched: false,
      },
    }), {})
  );

  const [isValid, setIsValid] = useState(false);

  const validateField = (name: string, value: any, rule: ValidationRule): string | undefined => {
    // Required validation
    if (rule.required) {
      const isEmpty = value === undefined || value === null || value === '' ||
                     (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        return typeof rule.required === 'string' ? rule.required : 'This field is required';
      }
    }

    // Skip other validations if value is empty and not required
    if (!value && value !== 0) return undefined;

    // Email validation
    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return typeof rule.email === 'string' ? rule.email : 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (rule.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return typeof rule.phone === 'string' ? rule.phone : 'Please enter a valid phone number';
      }
    }

    // URL validation
    if (rule.url) {
      try {
        new URL(value);
      } catch {
        return typeof rule.url === 'string' ? rule.url : 'Please enter a valid URL';
      }
    }

    // Min length validation
    if (rule.minLength) {
      const minLength = typeof rule.minLength === 'number' ? rule.minLength : rule.minLength.value;
      if (value.toString().length < minLength) {
        return typeof rule.minLength === 'object'
          ? rule.minLength.message
          : `Must be at least ${minLength} characters`;
      }
    }

    // Max length validation
    if (rule.maxLength) {
      const maxLength = typeof rule.maxLength === 'number' ? rule.maxLength : rule.maxLength.value;
      if (value.toString().length > maxLength) {
        return typeof rule.maxLength === 'object'
          ? rule.maxLength.message
          : `Must be no more than ${maxLength} characters`;
      }
    }

    // Min value validation
    if (rule.min !== undefined) {
      const min = typeof rule.min === 'number' ? rule.min : rule.min.value;
      if (Number(value) < min) {
        return typeof rule.min === 'object'
          ? rule.min.message
          : `Must be at least ${min}`;
      }
    }

    // Max value validation
    if (rule.max !== undefined) {
      const max = typeof rule.max === 'number' ? rule.max : rule.max.value;
      if (Number(value) > max) {
        return typeof rule.max === 'object'
          ? rule.max.message
          : `Must be no more than ${max}`;
      }
    }

    // Pattern validation
    if (rule.pattern) {
      const pattern = typeof rule.pattern === 'object' && 'value' in rule.pattern ? rule.pattern.value : rule.pattern;
      if (!pattern.test(value)) {
        return typeof rule.pattern === 'object' && 'message' in rule.pattern
          ? rule.pattern.message
          : 'Invalid format';
      }
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        return typeof result === 'string' ? result : 'Invalid value';
      }
    }

    return undefined;
  };

  const validateAllFields = () => {
    const newFields = { ...fields };
    let hasErrors = false;

    Object.keys(rules).forEach(name => {
      const error = validateField(name, newFields[name]?.value, rules[name]);
      newFields[name] = {
        ...newFields[name],
        error,
        touched: true,
      };
      if (error) hasErrors = true;
    });

    setFields(newFields);
    setIsValid(!hasErrors);
    return !hasErrors;
  };

  const setValue = (name: string, value: any) => {
    const error = fields[name]?.touched ? validateField(name, value, rules[name] || {}) : undefined;

    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error,
      },
    }));
  };

  const setTouched = (name: string, touched = true) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched,
        error: touched ? validateField(name, prev[name]?.value, rules[name] || {}) : undefined,
      },
    }));
  };

  const reset = (newValues?: Record<string, any>) => {
    const values = newValues || initialValues;
    setFields(Object.keys(values).reduce((acc, name) => ({
      ...acc,
      [name]: {
        name,
        value: values[name],
        error: undefined,
        touched: false,
      },
    }), {}));
  };

  const getFieldProps = (name: string) => ({
    value: fields[name]?.value || '',
    error: fields[name]?.error,
    onChange: (value: any) => setValue(name, value),
    onBlur: () => setTouched(name),
  });

  // Update isValid when fields change
  useEffect(() => {
    const hasErrors = Object.values(fields).some(field => field.error);
    const allRequired = Object.keys(rules).filter(name => rules[name].required);
    const allRequiredFilled = allRequired.every(name => {
      const value = fields[name]?.value;
      return value !== undefined && value !== null && value !== '';
    });

    setIsValid(!hasErrors && allRequiredFilled);
  }, [fields, rules]);

  return {
    fields,
    isValid,
    setValue,
    setTouched,
    validateAllFields,
    reset,
    getFieldProps,
    values: Object.keys(fields).reduce((acc, name) => ({
      ...acc,
      [name]: fields[name]?.value,
    }), {}),
    errors: Object.keys(fields).reduce((acc, name) => ({
      ...acc,
      [name]: fields[name]?.error,
    }), {}),
  };
};

// Multi-Step Form Hook
export const useMultiStepForm = (steps: string[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const previous = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const isStepComplete = (step: number) => completedSteps.has(step);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return {
    currentStep,
    currentStepName: steps[currentStep],
    totalSteps: steps.length,
    isFirstStep,
    isLastStep,
    completedSteps,
    next,
    previous,
    goToStep,
    markStepComplete,
    isStepComplete,
  };
};

// Form Stepper Component
export interface FormStepperProps {
  steps: Array<{ label: string; description?: string }>;
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}) => {
  return (
    <nav className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps.has(index);
        const isClickable = onStepClick && (isCompleted || index <= currentStep);

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <button
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                  isActive && 'border-primary-500 bg-primary-500 text-white',
                  isCompleted && !isActive && 'border-success-500 bg-success-500 text-white',
                  !isActive && !isCompleted && 'border-neutral-300 bg-white text-neutral-600',
                  isClickable && 'cursor-pointer hover:border-primary-400'
                )}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
              >
                {isCompleted ? (
                  <Icons.CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </button>

              <div className="mt-2 text-center">
                <Text
                  variant="caption"
                  className={cn(
                    'font-medium',
                    isActive && 'text-primary-600',
                    isCompleted && !isActive && 'text-success-600',
                    !isActive && !isCompleted && 'text-neutral-500'
                  )}
                >
                  {step.label}
                </Text>
                {step.description && (
                  <Text variant="caption" color="muted" className="block">
                    {step.description}
                  </Text>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors',
                  completedSteps.has(index) || currentStep > index
                    ? 'bg-success-500'
                    : 'bg-neutral-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Advanced File Upload Component
export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = multiple ? 10 : 1,
  onFilesChange,
  onError,
  disabled = false,
  className,
  children,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: File[]): File[] => {
    const validFiles: File[] = [];

    for (const file of fileList) {
      // Check file size
      if (file.size > maxSize) {
        onError?.(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}`);
        continue;
      }

      // Check file type
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(new RegExp(type.replace('*', '.*')));
        });

        if (!isAccepted) {
          onError?.(`File "${file.name}" is not an accepted file type`);
          continue;
        }
      }

      validFiles.push(file);

      // Check max files limit
      if (validFiles.length >= maxFiles) {
        if (fileList.length > maxFiles) {
          onError?.(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
        }
        break;
      }
    }

    return validFiles;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    const validFiles = validateFiles(filesArray);

    if (!multiple) {
      setFiles(validFiles.slice(0, 1));
      onFilesChange?.(validFiles.slice(0, 1));
    } else {
      const newFiles = [...files, ...validFiles];
      if (newFiles.length > maxFiles) {
        const limitedFiles = newFiles.slice(0, maxFiles);
        setFiles(limitedFiles);
        onFilesChange?.(limitedFiles);
      } else {
        setFiles(newFiles);
        onFilesChange?.(newFiles);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={className}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          dragOver && 'border-primary-400 bg-primary-50',
          disabled && 'opacity-50 cursor-not-allowed',
          !dragOver && !disabled && 'border-neutral-300 hover:border-primary-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {children || (
          <div>
            <Icons.Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <Text variant="body" className="mb-2">
              Drop files here or click to browse
            </Text>
            <Text variant="caption" color="muted">
              {accept && `Accepted formats: ${accept}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              {multiple && maxFiles > 1 && ` • Max files: ${maxFiles}`}
            </Text>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-neutral-50 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <Icons.File className="h-4 w-4 text-neutral-500" />
                <div>
                  <Text variant="body" className="font-medium">
                    {file.name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {formatFileSize(file.size)}
                  </Text>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <Icons.X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default useFormValidation;