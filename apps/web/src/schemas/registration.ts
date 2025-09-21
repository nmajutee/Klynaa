import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
const emailSchema = z.string().email('Please enter a valid email address');
const phoneSchema = z.string()
  .min(8, 'Phone number must be at least 8 digits')
  .regex(phoneRegex, 'Please enter a valid phone number');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

// File validation
const maxFileSize = 5 * 1024 * 1024; // 5MB
const acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const acceptedDocumentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const imageFileSchema = z.any()
  .optional()
  .refine((file) => !file || file?.size <= maxFileSize, 'File size must be less than 5MB')
  .refine(
    (file) => !file || acceptedImageTypes.includes(file?.type),
    'Only JPEG, JPG, and PNG files are accepted'
  );

const documentFileSchema = z.any()
  .optional()
  .refine((file) => !file || file?.size <= maxFileSize, 'File size must be less than 5MB')
  .refine(
    (file) => !file || acceptedDocumentTypes.includes(file?.type),
    'Only JPEG, JPG, PNG, and PDF files are accepted'
  );

// Worker Registration Schemas
export const workerAccountBasicsSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: emailSchema,
  phone_number: phoneSchema,
  password: passwordSchema,
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

export const workerProfileSchema = z.object({
  id_number: z.string()
    .min(5, 'ID number must be at least 5 characters')
    .max(20, 'ID number must be less than 20 characters'),
  profile_photo: imageFileSchema,
  date_of_birth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }, 'You must be at least 18 years old'),
  address: z.string()
    .min(10, 'Please provide a detailed address')
    .max(200, 'Address must be less than 200 characters'),
  availability_schedule: z.array(z.string())
    .min(1, 'Please select at least one availability option'),
});

export const workerVerificationSchema = z.object({
  id_document: documentFileSchema.refine(
    (file) => file instanceof File,
    'ID document upload is required'
  ),
  clearance_certificate: documentFileSchema.refine(
    (file) => file instanceof File,
    'Police clearance certificate is required'
  ),
  terms_agreed: z.boolean().refine(
    (val) => val === true,
    'You must agree to the Worker Terms & Conditions'
  ),
});

export const workerEarningsSchema = z.object({
  payout_method: z.enum(['bank_transfer', 'mobile_money', 'cash']).refine(
    (val) => val !== undefined,
    'Please select a payout method'
  ),
  payout_details: z.object({
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    account_name: z.string().optional(),
    mobile_number: z.string().optional(),
  }).optional(),
  tax_id: z.string().optional(),
}).refine((data) => {
  if (data.payout_method === 'bank_transfer') {
    return data.payout_details?.bank_name &&
           data.payout_details?.account_number &&
           data.payout_details?.account_name;
  }
  if (data.payout_method === 'mobile_money') {
    return data.payout_details?.mobile_number;
  }
  return true;
}, {
  message: 'Please provide required payout details',
  path: ['payout_details'],
});

// Bin Owner Registration Schemas
export const binOwnerAccountBasicsSchema = z.object({
  account_type: z.enum(['individual', 'business', 'institution']),
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  org_name: z.string()
    .max(100, 'Organization name must be less than 100 characters')
    .optional(),
  email: emailSchema,
  phone_number: phoneSchema,
  password: passwordSchema,
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
}).refine((data) => {
  if (data.account_type !== 'individual') {
    return data.org_name && data.org_name.length >= 2;
  }
  return true;
}, {
  message: 'Organization name is required for business and institution accounts',
  path: ['org_name'],
});

export const binOwnerDetailsSchema = z.object({
  address: z.string()
    .min(10, 'Please provide a detailed address')
    .max(200, 'Address must be less than 200 characters'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bin_type: z.enum(['residential', 'commercial', 'industrial']).refine(
    (val) => val !== undefined,
    'Please select a bin type'
  ),
  bin_count: z.number()
    .min(1, 'Must have at least 1 bin')
    .max(100, 'Maximum 100 bins allowed'),
  pickup_frequency: z.enum(['daily', 'weekly', 'bi_weekly', 'monthly']).refine(
    (val) => val !== undefined,
    'Please select pickup frequency'
  ),
});

export const binOwnerBillingSchema = z.object({
  plan_id: z.string().min(1, 'Please select a subscription plan'),
  payment_method: z.enum(['card', 'mobile_money', 'bank_transfer']).refine(
    (val) => val !== undefined,
    'Please select a payment method'
  ),
  payment_details: z.object({
    card_number: z.string().optional(),
    expiry_date: z.string().optional(),
    cvv: z.string().optional(),
    mobile_number: z.string().optional(),
    bank_account: z.string().optional(),
  }).optional(),
  billing_address: z.string()
    .min(10, 'Please provide a billing address')
    .max(200, 'Billing address must be less than 200 characters')
    .optional(),
}).refine((data) => {
  if (data.payment_method === 'card') {
    return data.payment_details?.card_number &&
           data.payment_details?.expiry_date &&
           data.payment_details?.cvv;
  }
  if (data.payment_method === 'mobile_money') {
    return data.payment_details?.mobile_number;
  }
  if (data.payment_method === 'bank_transfer') {
    return data.payment_details?.bank_account;
  }
  return true;
}, {
  message: 'Please provide required payment details',
  path: ['payment_details'],
});

// OTP Verification Schema
export const otpVerificationSchema = z.object({
  otp_code: z.string()
    .min(4, 'OTP must be at least 4 digits')
    .max(6, 'OTP must be at most 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

// Type exports for TypeScript integration
export type WorkerAccountBasicsForm = z.infer<typeof workerAccountBasicsSchema>;
export type WorkerProfileForm = z.infer<typeof workerProfileSchema>;
export type WorkerVerificationForm = z.infer<typeof workerVerificationSchema>;
export type WorkerEarningsForm = z.infer<typeof workerEarningsSchema>;

export type BinOwnerAccountBasicsForm = z.infer<typeof binOwnerAccountBasicsSchema>;
export type BinOwnerDetailsForm = z.infer<typeof binOwnerDetailsSchema>;
export type BinOwnerBillingForm = z.infer<typeof binOwnerBillingSchema>;

export type OTPVerificationForm = z.infer<typeof otpVerificationSchema>;