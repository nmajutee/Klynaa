import React from 'react';
import { Check, Circle, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Step {
  id: number;
  title: string;
  description: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  userType: 'worker' | 'bin_owner';
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  userType,
  className
}) => {
  const getStepStatus = (stepNumber: number): 'completed' | 'current' | 'upcoming' => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepColor = (status: string) => {
    if (userType === 'worker') {
      switch (status) {
        case 'completed':
          return 'bg-emerald-600 text-white border-emerald-600';
        case 'current':
          return 'bg-emerald-100 text-emerald-600 border-emerald-600';
        default:
          return 'bg-neutral-100 text-neutral-400 border-neutral-300';
      }
    } else {
      switch (status) {
        case 'completed':
          return 'bg-blue-600 text-white border-blue-600';
        case 'current':
          return 'bg-blue-100 text-blue-600 border-blue-600';
        default:
          return 'bg-neutral-100 text-neutral-400 border-neutral-300';
      }
    }
  };

  const getConnectorColor = (stepIndex: number) => {
    const status = getStepStatus(steps[stepIndex].id);
    if (userType === 'worker') {
      return status === 'completed' ? 'bg-emerald-600' : 'bg-neutral-300';
    } else {
      return status === 'completed' ? 'bg-blue-600' : 'bg-neutral-300';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    getStepColor(status)
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Step Title & Description */}
                <div className="text-center mt-3 max-w-32">
                  <p className={cn(
                    'text-sm font-medium',
                    status === 'current' ? 'text-neutral-900' : 'text-neutral-600'
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 hidden lg:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 px-4">
                  <div
                    className={cn(
                      'h-0.5 transition-all duration-200',
                      getConnectorColor(index)
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-start">
              {/* Step Circle and Line Container */}
              <div className="flex flex-col items-center mr-4">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    getStepColor(status)
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Vertical Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-8 mt-2 transition-all duration-200',
                      getConnectorColor(index)
                    )}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pb-6">
                <p className={cn(
                  'font-medium',
                  status === 'current' ? 'text-neutral-900' : 'text-neutral-600'
                )}>
                  {step.title}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;