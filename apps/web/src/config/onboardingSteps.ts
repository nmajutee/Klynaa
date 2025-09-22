import { Step } from '../components/onboarding/Stepper';

// Centralized step configuration for all onboarding flows
export const ONBOARDING_STEPS = {
  worker: [
    {
      id: 1,
      title: 'Account Basics',
      description: 'Personal information and credentials',
    },
    {
      id: 2,
      title: 'Phone Verification',
      description: 'Verify your phone number',
    },
  ] as Step[],

  bin_owner: [
    {
      id: 1,
      title: 'Account Basics',
      description: 'Personal or business information',
    },
    {
      id: 2,
      title: 'Phone Verification',
      description: 'Verify your phone number',
    },
  ] as Step[],
};

// Helper function to get steps by user type
export const getStepsForUserType = (userType: 'worker' | 'bin_owner'): Step[] => {
  return ONBOARDING_STEPS[userType] || [];
};

// Total steps for each user type
export const TOTAL_STEPS = {
  worker: ONBOARDING_STEPS.worker.length,
  bin_owner: ONBOARDING_STEPS.bin_owner.length,
};

// Step navigation helpers
export const getNextStep = (currentStep: number, userType: 'worker' | 'bin_owner'): number | null => {
  const totalSteps = TOTAL_STEPS[userType];
  return currentStep < totalSteps ? currentStep + 1 : null;
};

export const getPrevStep = (currentStep: number): number | null => {
  return currentStep > 1 ? currentStep - 1 : null;
};

export const isFirstStep = (currentStep: number): boolean => {
  return currentStep === 1;
};

export const isLastStep = (currentStep: number, userType: 'worker' | 'bin_owner'): boolean => {
  return currentStep === TOTAL_STEPS[userType];
};