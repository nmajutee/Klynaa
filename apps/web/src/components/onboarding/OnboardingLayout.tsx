import React from 'react';
import { Icon } from '../../../components/ui/Icons';
import Link from 'next/link';
import { useOnboardingStore } from '../../stores/onboarding';
import { Stepper } from './Stepper';
import { getStepsForUserType } from '../../config/onboardingSteps';
import { cn } from '../../lib/utils';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  showCloseButton = true,
  className,
}) => {
  const { userType, currentStep, prevStep } = useOnboardingStore();

  const steps = userType ? getStepsForUserType(userType) : [];
  const themeColor = userType === 'worker' ? 'emerald' : 'blue';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and Title */}
            <div className="flex items-center gap-4">
              {showBackButton && currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    themeColor === 'emerald'
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-blue-600 hover:bg-blue-50'
                  )}
                  aria-label="Go back"
                >
                  <Icon name="ArrowLeft" size={20 as any} />
                </button>
              )}

              <div>
                <h1 className="text-lg font-semibold text-neutral-900">
                  {title || `${userType === 'worker' ? 'Worker' : 'Bin Owner'} Registration`}
                </h1>
                {subtitle && (
                  <p className="text-sm text-neutral-600">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side - Close button */}
            {showCloseButton && (
              <Link
                href="/auth/register"
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Close registration"
              >
                <Icon name="X" size={20 as any} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            userType={userType || 'worker'}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-200', className)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;