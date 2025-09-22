/**
 * Centralized form settings for registration and verification flows
 */

// Phone number configuration
export const PHONE_SETTINGS = {
  // Default country code
  defaultCountryCode: '+237',

  // Phone number format regex (Cameroon format)
  phoneRegex: /^\+237[0-9]{9}$/,

  // Phone number validation message
  phoneValidationMessage: 'Please enter a valid Cameroon phone number (+237 followed by 9 digits)',

  // Phone number placeholder
  phonePlaceholder: '+237 6XX XXX XXX',

  // Phone number mask/format
  phoneFormat: '+237 ### ### ###',

  // Supported country codes (can be expanded later)
  supportedCountryCodes: [
    { code: '+237', country: 'Cameroon', flag: '🇨🇲' }
  ]
} as const;

// OTP/Verification settings
export const OTP_SETTINGS = {
  // OTP length
  codeLength: 6,

  // OTP expiry time (in minutes)
  expiryMinutes: 10,

  // Resend cooldown (in seconds)
  resendCooldown: 60,

  // Test OTP code for development
  testCode: '123456',

  // OTP validation regex
  otpRegex: /^[0-9]{6}$/,

  // OTP validation message
  otpValidationMessage: 'Please enter a valid 6-digit code',

  // OTP placeholder
  otpPlaceholder: 'Enter 6-digit code'
} as const;

// Form validation settings
export const FORM_VALIDATION = {
  // Name validation
  name: {
    minLength: 2,
    maxLength: 50,
    regex: /^[a-zA-Z\s'-]+$/,
    message: 'Name must contain only letters, spaces, hyphens, and apostrophes'
  },

  // Email validation
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },

  // Password validation (for future use)
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
  }
} as const;

// UI/UX settings for forms
export const FORM_UI_SETTINGS = {
  // Form submission states
  loadingStates: {
    creatingAccount: 'Creating Account...',
    sendingCode: 'Sending Code...',
    verifying: 'Verifying...',
    resending: 'Sending...',
    updating: 'Updating...'
  },

  // Success messages
  successMessages: {
    accountCreated: 'Account created successfully!',
    codeResent: 'Verification code sent!',
    phoneVerified: 'Phone number verified successfully!',
    profileUpdated: 'Profile updated successfully!'
  },

  // Error messages
  errorMessages: {
    genericError: 'Something went wrong. Please try again.',
    networkError: 'Network error. Please check your connection.',
    invalidCode: 'Invalid verification code. Please try again.',
    expiredCode: 'Verification code has expired. Please request a new one.',
    phoneAlreadyExists: 'This phone number is already registered.',
    emailAlreadyExists: 'This email address is already registered.'
  },

  // Form field styling classes
  fieldClasses: {
    input: 'w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200',
    inputError: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    label: 'block text-sm font-medium text-neutral-900 mb-2',
    error: 'text-red-600 text-sm mt-1',
    button: {
      primary: 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2',
      secondary: 'text-emerald-600 hover:text-emerald-700 font-medium',
      danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium'
    }
  }
} as const;

// Development/Testing settings
export const DEV_SETTINGS = {
  // Mock data for testing
  mockUser: {
    worker: {
      name: 'Test Worker',
      email: 'worker@test.com',
      phone: '+237612345678'
    },
    binOwner: {
      name: 'Test Bin Owner',
      email: 'owner@test.com',
      phone: '+237698765432'
    }
  },

  // Skip verification in development
  skipVerification: process.env.NODE_ENV === 'development',

  // Auto-fill forms in development
  autoFillForms: process.env.NODE_ENV === 'development',

  // Show debug info
  showDebugInfo: process.env.NODE_ENV === 'development'
} as const;

// Helper functions
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Add default country code if not present
  if (!cleaned.startsWith('+')) {
    return PHONE_SETTINGS.defaultCountryCode + cleaned;
  }

  return cleaned;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  return PHONE_SETTINGS.phoneRegex.test(formatted);
};

export const isValidOTP = (otp: string): boolean => {
  return OTP_SETTINGS.otpRegex.test(otp);
};

export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${remainingSeconds}s`;
};