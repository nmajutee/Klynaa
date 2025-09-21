import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { Input, Label, Field } from '../../../src/design-system/components/Form';
import { useOnboardingStore } from '../../../src/stores/onboarding';
import OnboardingLayout from '../../../src/components/onboarding/OnboardingLayout';

// Step 1: Account Basics Schema
const binOwnerBasicsSchema = z.object({
  // Personal Information
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string().min(9, 'Please enter a valid phone number'),
  account_type: z.enum(['individual', 'business', 'institution']),

  // Organization name (optional for business/institution)
  org_name: z.string().optional(),

  // Account Security
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  password_confirm: z.string(),

  // Address Information
  address: z.string().min(10, 'Please provide your full address'),

  // Agreement
  terms_agreed: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type BinOwnerBasicsForm = z.infer<typeof binOwnerBasicsSchema>;

export default function BinOwnerRegistrationPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    setUserType,
    setCurrentStep,
    binOwnerData,
    updateBinOwnerData,
    clearBinOwnerData,
    phoneVerified,
    setOtpSent
  } = useOnboardingStore();

  // Set user type when component mounts
  useEffect(() => {
    setUserType('bin_owner');
    setCurrentStep(1);
  }, [setUserType, setCurrentStep]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<BinOwnerBasicsForm>({
    resolver: zodResolver(binOwnerBasicsSchema),
    defaultValues: {
      full_name: binOwnerData?.full_name || '',
      email: binOwnerData?.email || '',
      phone_number: binOwnerData?.phone_number || '',
      account_type: binOwnerData?.account_type || 'individual',
      org_name: binOwnerData?.org_name || '',
      password: '',
      password_confirm: '',
      address: binOwnerData?.address || '',
      terms_agreed: binOwnerData?.terms_agreed || false,
    },
  });

  const onSubmit = async (data: BinOwnerBasicsForm) => {
    console.log('🔥 Bin Owner Form Submit - Data:', data);
    console.log('🔥 Form validation errors:', errors);

    setIsSubmitting(true);

    try {
      // Save data to store
      updateBinOwnerData(data);

      // Move to next step
      setCurrentStep(2);

      console.log('🔥 Moving to next step, redirecting...');

      // Simulate API call for phone verification trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to service details
      router.push('/auth/register/bin-owner/details');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };  // Auto-save form data as user types
  const watchedFields = watch();
  useEffect(() => {
    const subscription = watch((value) => {
      updateBinOwnerData(value as any);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateBinOwnerData]);

  return (
    <OnboardingLayout
      title="Join as Bin Owner"
      subtitle="Create your account to manage waste collection services"
      showBackButton={true}
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
                Personal Information
              </h3>

              <Field label="Full Name" error={errors.full_name?.message}>
                <Input
                  {...register('full_name')}
                  placeholder="Enter your full name"
                  error={errors.full_name?.message}
                />
              </Field>

              <Field label="Account Type" error={errors.account_type?.message}>
                <select
                  {...register('account_type')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.account_type ? 'border-red-500' : 'border-neutral-300'
                  }`}
                >
                  <option value="individual">Individual/Personal</option>
                  <option value="business">Business</option>
                  <option value="institution">Institution</option>
                </select>
              </Field>

              {watch('account_type') !== 'individual' && (
                <Field label="Organization Name" error={errors.org_name?.message}>
                  <Input
                    {...register('org_name')}
                    placeholder="Enter organization name"
                    error={errors.org_name?.message}
                  />
                </Field>
              )}

              <Field label="Email Address" error={errors.email?.message}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="your.email@example.com"
                    className="pl-10"
                    error={errors.email?.message}
                  />
                </div>
              </Field>

              <Field label="Phone Number" error={errors.phone_number?.message}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    type="tel"
                    {...register('phone_number')}
                    placeholder="+237 6XX XXX XXX"
                    className="pl-10"
                    error={errors.phone_number?.message}
                  />
                </div>
              </Field>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
                Account Security
              </h3>

              <Field label="Password" error={errors.password?.message}>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Create a secure password"
                    className="pr-10"
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-400" />
                    )}
                  </button>
                </div>
              </Field>

              <Field label="Confirm Password" error={errors.password_confirm?.message}>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('password_confirm')}
                    placeholder="Confirm your password"
                    className="pr-10"
                    error={errors.password_confirm?.message}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-400" />
                    )}
                  </button>
                </div>
              </Field>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
                Service Address
              </h3>

              <Field label="Full Address" error={errors.address?.message}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    {...register('address')}
                    placeholder="Street address, building name, apartment number, city, region"
                    className="pl-10"
                    error={errors.address?.message}
                  />
                </div>
              </Field>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('terms_agreed')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                />
                <label className="text-sm text-neutral-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms_agreed && (
                <p className="text-sm text-red-600">{errors.terms_agreed.message}</p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-neutral-200">
              <Link
                href="/auth/register"
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Back
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                onClick={() => {
                  console.log('🔥 Bin Owner Continue button clicked!');
                  console.log('🔥 Form errors:', errors);
                  console.log('🔥 Is submitting:', isSubmitting);
                }}
              >
                {isSubmitting ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </form>
      </OnboardingLayout>
    );
}