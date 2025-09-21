import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: Record<string, (value: any, formData: Record<string, any>) => string | null>;
  isOptional?: boolean;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'date' | 'time' | 'file' | 'number';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: (value: any, formData: Record<string, any>) => string | null;
  conditional?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
  props?: Record<string, any>;
  helpText?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: FormStep[];
  metadata?: Record<string, any>;
}

// Form Wizard Component
export interface FormWizardProps {
  steps: FormStep[];
  onComplete: (data: Record<string, any>) => void;
  onStepChange?: (stepIndex: number, data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  allowBackward?: boolean;
  showProgress?: boolean;
  className?: string;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  onComplete,
  onStepChange,
  initialData = {},
  allowBackward = true,
  showProgress = true,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Validate field
  const validateField = useCallback((field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'tel' && value) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number';
      }
    }

    if (field.validation) {
      return field.validation(value, formData);
    }

    return null;
  }, [formData]);

  // Validate current step
  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex];
    const stepErrors: Record<string, string> = {};

    for (const field of step.fields) {
      // Check conditional visibility
      if (field.conditional && !isFieldVisible(field)) {
        continue;
      }

      const fieldValue = formData[field.id];
      const error = validateField(field, fieldValue);

      if (error) {
        stepErrors[field.id] = error;
      }
    }

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [steps, formData, validateField]);

  // Check if field is visible based on conditions
  const isFieldVisible = useCallback((field: FormField): boolean => {
    if (!field.conditional) return true;

    const { field: condField, value: condValue, operator = 'equals' } = field.conditional;
    const fieldValue = formData[condField];

    switch (operator) {
      case 'equals':
        return fieldValue === condValue;
      case 'not_equals':
        return fieldValue !== condValue;
      case 'contains':
        return Array.isArray(fieldValue) ? fieldValue.includes(condValue) : String(fieldValue).includes(condValue);
      case 'greater_than':
        return Number(fieldValue) > Number(condValue);
      case 'less_than':
        return Number(fieldValue) < Number(condValue);
      default:
        return true;
    }
  }, [formData]);

  // Update field value
  const updateField = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setTouched(prev => ({ ...prev, [fieldId]: true }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  }, [errors]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      onStepChange?.(nextStepIndex, formData);
    }
  }, [currentStep, validateStep, formData, onStepChange]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (allowBackward && currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      onStepChange?.(prevStepIndex, formData);
    }
  }, [allowBackward, currentStep, formData, onStepChange]);

  // Complete form
  const completeForm = useCallback(() => {
    if (validateStep(currentStep)) {
      onComplete(formData);
    }
  }, [currentStep, validateStep, formData, onComplete]);

  // Jump to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex, formData);
    }
  }, [steps.length, formData, onStepChange]);

  // Render field based on type
  const renderField = useCallback((field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const fieldValue = formData[field.id] || '';
    const fieldError = errors[field.id];
    const isFieldTouched = touched[field.id];

    const baseInputClasses = cn(
      'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
      fieldError ? 'border-danger-300' : 'border-neutral-300',
      'disabled:bg-neutral-50 disabled:cursor-not-allowed'
    );

    const renderInput = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              id={field.id}
              value={fieldValue}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={cn(baseInputClasses, 'min-h-20 resize-vertical')}
              {...field.props}
            />
          );

        case 'select':
          return (
            <select
              id={field.id}
              value={fieldValue}
              onChange={(e) => updateField(field.id, e.target.value)}
              className={baseInputClasses}
              {...field.props}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'multiselect':
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(fieldValue) && fieldValue.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (e.target.checked) {
                        updateField(field.id, [...currentValues, option.value]);
                      } else {
                        updateField(field.id, currentValues.filter((v: any) => v !== option.value));
                      }
                    }}
                    disabled={option.disabled}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{option.label}</span>
                </label>
              ))}
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={(e) => updateField(field.id, e.target.value)}
                    disabled={option.disabled}
                    className="border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{option.label}</span>
                </label>
              ))}
            </div>
          );

        case 'checkbox':
          return (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Boolean(fieldValue)}
                onChange={(e) => updateField(field.id, e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                {...field.props}
              />
              <span className="text-sm text-neutral-700">{field.label}</span>
            </label>
          );

        case 'file':
          return (
            <input
              type="file"
              id={field.id}
              onChange={(e) => updateField(field.id, e.target.files?.[0])}
              className={cn(
                'w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100'
              )}
              {...field.props}
            />
          );

        default:
          return (
            <input
              type={field.type}
              id={field.id}
              value={fieldValue}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
              {...field.props}
            />
          );
      }
    };

    return (
      <div key={field.id} className="space-y-2">
        {field.type !== 'checkbox' && (
          <label htmlFor={field.id} className="block text-sm font-medium text-neutral-700">
            {field.label}
            {field.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        {renderInput()}

        {field.helpText && (
          <p className="text-xs text-neutral-500">{field.helpText}</p>
        )}

        {fieldError && isFieldTouched && (
          <p className="text-sm text-danger-600 flex items-center space-x-1">
            <Icons.AlertTriangle className="h-4 w-4" />
            <span>{fieldError}</span>
          </p>
        )}
      </div>
    );
  }, [formData, errors, touched, updateField, isFieldVisible]);

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-neutral-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(index)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  index === currentStep
                    ? 'bg-primary-600 text-white'
                    : index < currentStep
                    ? 'bg-success-100 text-success-600'
                    : 'bg-neutral-200 text-neutral-400'
                )}
              >
                {index < currentStep ? (
                  <Icons.CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-8 h-0.5',
                  index < currentStep ? 'bg-success-200' : 'bg-neutral-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            {currentStepData.title}
          </h2>
          {currentStepData.description && (
            <p className="text-sm text-neutral-600 mt-1">
              {currentStepData.description}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {currentStepData.fields.map(renderField)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={isFirstStep || !allowBackward}
            className={cn(
              'px-4 py-2 border border-neutral-300 rounded-md font-medium transition-colors',
              'hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Previous
          </button>

          <button
            onClick={isLastStep ? completeForm : nextStep}
            className="px-6 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            {isLastStep ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Conditional Field Renderer
export interface ConditionalFieldProps {
  field: FormField;
  value: any;
  formData: Record<string, any>;
  onChange: (value: any) => void;
  error?: string;
  className?: string;
}

export const ConditionalField: React.FC<ConditionalFieldProps> = ({
  field,
  value,
  formData,
  onChange,
  error,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!field.conditional) {
      setIsVisible(true);
      return;
    }

    const { field: condField, value: condValue, operator = 'equals' } = field.conditional;
    const condFieldValue = formData[condField];

    let visible = false;
    switch (operator) {
      case 'equals':
        visible = condFieldValue === condValue;
        break;
      case 'not_equals':
        visible = condFieldValue !== condValue;
        break;
      case 'contains':
        visible = Array.isArray(condFieldValue)
          ? condFieldValue.includes(condValue)
          : String(condFieldValue).includes(condValue);
        break;
      case 'greater_than':
        visible = Number(condFieldValue) > Number(condValue);
        break;
      case 'less_than':
        visible = Number(condFieldValue) < Number(condValue);
        break;
    }

    setIsVisible(visible);
  }, [field.conditional, formData]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn('transition-all duration-200', className)}>
      {/* Field rendering logic would go here */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">
          {field.label}
          {field.required && <span className="text-danger-500 ml-1">*</span>}
        </label>

        {/* Simplified input - in real implementation, this would handle all field types */}
        <input
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
            error ? 'border-danger-300' : 'border-neutral-300'
          )}
          placeholder={field.placeholder}
        />

        {error && (
          <p className="text-sm text-danger-600">{error}</p>
        )}
      </div>
    </div>
  );
};

// Form Template Selector
export interface FormTemplateSelectorProps {
  templates: FormTemplate[];
  onSelect: (template: FormTemplate) => void;
  selectedTemplate?: FormTemplate;
  className?: string;
}

export const FormTemplateSelector: React.FC<FormTemplateSelectorProps> = ({
  templates,
  onSelect,
  selectedTemplate,
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Choose a Form Template
        </h3>

        {/* Search */}
        <div className="relative mb-4">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={cn(
              'text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md',
              selectedTemplate?.id === template.id
                ? 'border-primary-300 bg-primary-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-neutral-900">{template.name}</h4>
              <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                {template.category}
              </span>
            </div>

            <p className="text-sm text-neutral-600 mb-3">
              {template.description}
            </p>

            <div className="flex items-center space-x-4 text-xs text-neutral-500">
              <span>{template.steps.length} steps</span>
              <span>{template.steps.reduce((acc, step) => acc + step.fields.length, 0)} fields</span>
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <Icons.AlertTriangle className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-neutral-500">No templates found</p>
        </div>
      )}
    </div>
  );
};

// Dynamic Form Builder
export interface FormBuilderProps {
  initialSteps?: FormStep[];
  onSave: (steps: FormStep[]) => void;
  className?: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialSteps = [],
  onSave,
  className,
}) => {
  const [steps, setSteps] = useState<FormStep[]>(initialSteps);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [draggedField, setDraggedField] = useState<FormField | null>(null);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Icons.User },
    { type: 'email', label: 'Email', icon: Icons.Settings },
    { type: 'tel', label: 'Phone', icon: Icons.Settings },
    { type: 'textarea', label: 'Textarea', icon: Icons.User },
    { type: 'select', label: 'Select', icon: Icons.Settings },
    { type: 'multiselect', label: 'Multi Select', icon: Icons.Settings },
    { type: 'radio', label: 'Radio Button', icon: Icons.Settings },
    { type: 'checkbox', label: 'Checkbox', icon: Icons.Settings },
    { type: 'date', label: 'Date', icon: Icons.Settings },
    { type: 'file', label: 'File Upload', icon: Icons.Settings },
  ];

  const addStep = () => {
    const newStep: FormStep = {
      id: `step-${Date.now()}`,
      title: 'New Step',
      description: '',
      fields: [],
    };
    setSteps([...steps, newStep]);
    setSelectedStep(steps.length);
  };

  const updateStep = (stepIndex: number, updates: Partial<FormStep>) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], ...updates };
    setSteps(updatedSteps);
  };

  const addField = (stepIndex: number, fieldType: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType as any,
      label: `New ${fieldType} Field`,
      required: false,
    };

    const updatedSteps = [...steps];
    updatedSteps[stepIndex].fields.push(newField);
    setSteps(updatedSteps);
  };

  const updateField = (stepIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].fields[fieldIndex] = {
      ...updatedSteps[stepIndex].fields[fieldIndex],
      ...updates,
    };
    setSteps(updatedSteps);
  };

  const removeField = (stepIndex: number, fieldIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].fields.splice(fieldIndex, 1);
    setSteps(updatedSteps);
  };

  return (
    <div className={cn('flex h-screen bg-neutral-50', className)}>
      {/* Steps Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Form Steps</h3>
          <button
            onClick={addStep}
            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
          >
            <Icons.Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setSelectedStep(index)}
              className={cn(
                'w-full text-left p-3 rounded-md transition-colors',
                selectedStep === index
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'hover:bg-neutral-50'
              )}
            >
              <div className="font-medium text-sm">{step.title}</div>
              <div className="text-xs text-neutral-500">
                {step.fields.length} fields
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => onSave(steps)}
          className="w-full mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Save Form
        </button>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex">
        {/* Step Editor */}
        <div className="flex-1 p-6 overflow-y-auto">
          {steps[selectedStep] && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <input
                  type="text"
                  value={steps[selectedStep].title}
                  onChange={(e) => updateStep(selectedStep, { title: e.target.value })}
                  className="text-2xl font-semibold w-full bg-transparent border-none outline-none text-neutral-900"
                  placeholder="Step Title"
                />
                <textarea
                  value={steps[selectedStep].description || ''}
                  onChange={(e) => updateStep(selectedStep, { description: e.target.value })}
                  className="mt-2 w-full bg-transparent border-none outline-none text-neutral-600 resize-none"
                  placeholder="Step description..."
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                {steps[selectedStep].fields.map((field, fieldIndex) => (
                  <div
                    key={field.id}
                    className="p-4 border border-neutral-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(selectedStep, fieldIndex, { label: e.target.value })}
                        className="font-medium bg-transparent border-none outline-none"
                        placeholder="Field Label"
                      />
                      <button
                        onClick={() => removeField(selectedStep, fieldIndex)}
                        className="text-danger-600 hover:bg-danger-50 p-1 rounded"
                      >
                        <Icons.XCircle className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={field.type}
                        onChange={(e) => updateField(selectedStep, fieldIndex, { type: e.target.value as any })}
                        className="px-3 py-2 border border-neutral-300 rounded-md text-sm"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.type} value={type.type}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(selectedStep, fieldIndex, { required: e.target.checked })}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(selectedStep, fieldIndex, { placeholder: e.target.value })}
                      placeholder="Placeholder text..."
                      className="mt-2 w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                    />
                  </div>
                ))}

                {/* Add Field Button */}
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                  <p className="text-neutral-500 mb-2">Add a field to this step</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {fieldTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.type}
                          onClick={() => addField(selectedStep, type.type)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormWizard;