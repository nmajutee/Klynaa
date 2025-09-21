import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Registration form data types
export interface WorkerRegistrationData {
  // Step 1: Account Basics
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;

  // Step 2: Worker Profile
  id_number?: string;
  profile_photo?: File;
  date_of_birth?: string;
  address?: string;
  availability_schedule?: string[];

  // Step 3: Verification
  id_document?: File;
  clearance_certificate?: File;
  terms_agreed: boolean;

  // Step 4: Earnings Setup
  payment_method?: 'mobile_money' | 'bank_transfer' | 'cash';
  mobile_money_number?: string;
  mobile_money_provider?: 'mtn' | 'orange';
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  tax_id?: string;
  tax_residence?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
}

export interface BinOwnerRegistrationData {
  // Step 1: Account Basics
  full_name: string;
  org_name?: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
  account_type: 'individual' | 'business' | 'institution';
  terms_agreed: boolean;

  // Step 2: Bin Details
  address: string;
  latitude?: number;
  longitude?: number;
  bin_type: 'residential' | 'commercial' | 'industrial';
  bin_count: number;
  pickup_frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';

  // Step 3: Billing & Subscription
  payment_method?: 'momo' | 'om' | 'card' | 'cash';
  phone_payment?: string;
  subscription_plan?: 'basic' | 'standard' | 'premium';
  billing_cycle?: 'monthly' | 'quarterly' | 'annual';
  terms_billing?: boolean;
  plan_id?: string;
  payment_details?: {
    card_number?: string;
    expiry_date?: string;
    cvv?: string;
    mobile_number?: string;
    bank_account?: string;
  };
  billing_address?: string;
}

export interface OnboardingState {
  // Flow control
  userType: 'worker' | 'bin_owner' | null;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  errors: Record<string, string>;

  // Form data
  workerData: Partial<WorkerRegistrationData>;
  binOwnerData: Partial<BinOwnerRegistrationData>;

  // OTP verification
  otpSent: boolean;
  otpVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;

  // Actions
  setUserType: (type: 'worker' | 'bin_owner') => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  // Worker data actions
  updateWorkerData: (data: Partial<WorkerRegistrationData>) => void;
  clearWorkerData: () => void;

  // Bin Owner data actions
  updateBinOwnerData: (data: Partial<BinOwnerRegistrationData>) => void;
  clearBinOwnerData: () => void;

  // OTP actions
  setOtpSent: (sent: boolean) => void;
  setOtpVerified: (verified: boolean) => void;
  setPhoneVerified: (verified: boolean) => void;
  setEmailVerified: (verified: boolean) => void;

  // Navigation helpers
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Reset everything
  resetOnboarding: () => void;
}

const initialWorkerData: Partial<WorkerRegistrationData> = {
  full_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirm: '',
  terms_agreed: false,
};

const initialBinOwnerData: Partial<BinOwnerRegistrationData> = {
  full_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirm: '',
  account_type: 'individual',
  bin_type: 'residential',
  bin_count: 1,
  pickup_frequency: 'weekly',
  payment_method: 'card',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      userType: null,
      currentStep: 1,
      totalSteps: 0,
      isLoading: false,
      errors: {},

      workerData: initialWorkerData,
      binOwnerData: initialBinOwnerData,

      otpSent: false,
      otpVerified: false,
      phoneVerified: false,
      emailVerified: false,

      // Actions
      setUserType: (type) => set({
        userType: type,
        totalSteps: type === 'worker' ? 5 : 4,
        currentStep: 1
      }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (field, error) => set(state => ({
        errors: { ...state.errors, [field]: error }
      })),

      clearError: (field) => set(state => {
        const newErrors = { ...state.errors };
        delete newErrors[field];
        return { errors: newErrors };
      }),

      clearAllErrors: () => set({ errors: {} }),

      // Worker data actions
      updateWorkerData: (data) => set(state => ({
        workerData: { ...state.workerData, ...data }
      })),

      clearWorkerData: () => set({ workerData: initialWorkerData }),

      // Bin Owner data actions
      updateBinOwnerData: (data) => set(state => ({
        binOwnerData: { ...state.binOwnerData, ...data }
      })),

      clearBinOwnerData: () => set({ binOwnerData: initialBinOwnerData }),

      // OTP actions
      setOtpSent: (sent) => set({ otpSent: sent }),
      setOtpVerified: (verified) => set({ otpVerified: verified }),
      setPhoneVerified: (verified) => set({ phoneVerified: verified }),
      setEmailVerified: (verified) => set({ emailVerified: verified }),

      // Navigation helpers
      nextStep: () => set(state => ({
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      })),

      prevStep: () => set(state => ({
        currentStep: Math.max(state.currentStep - 1, 1)
      })),

      goToStep: (step) => set(state => ({
        currentStep: Math.min(Math.max(step, 1), state.totalSteps)
      })),

      // Reset everything
      resetOnboarding: () => set({
        userType: null,
        currentStep: 1,
        totalSteps: 0,
        isLoading: false,
        errors: {},
        workerData: initialWorkerData,
        binOwnerData: initialBinOwnerData,
        otpSent: false,
        otpVerified: false,
        phoneVerified: false,
        emailVerified: false,
      }),
    }),
    {
      name: 'klynaa-onboarding',
      partialize: (state) => ({
        userType: state.userType,
        currentStep: state.currentStep,
        totalSteps: state.totalSteps,
        workerData: state.workerData,
        binOwnerData: state.binOwnerData,
        phoneVerified: state.phoneVerified,
        emailVerified: state.emailVerified,
      }),
    }
  )
);