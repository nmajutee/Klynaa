import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '../../../components/ui/Icons';
import { useOnboardingStore } from '../../../src/stores/onboarding';
import OnboardingLayout from '../../../src/components/onboarding/OnboardingLayout';
import { z } from 'zod';
import { Input, Label, Field } from '../../../src/design-system/components/Form';

// Bin Owner Account Basics Schema
const binOwnerAccountBasicsSchema = z.object({
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string()
    .min(8, 'Phone number must be at least 8 digits')
    .regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  account_type: z.enum(['individual', 'business', 'institution']),
  org_name: z.string().optional(),
  address: z.string().min(10, 'Please provide your full address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

export type BinOwnerAccountBasicsForm = z.infer<typeof binOwnerAccountBasicsSchema>;

export default function BinOwnerRegistrationPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    setUserType,
    binOwnerData,
    updateBinOwnerData,
    setCurrentStep,
    phoneVerified,
    setOtpSent
  } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch
  } = useForm<BinOwnerAccountBasicsForm>({
    resolver: zodResolver(binOwnerAccountBasicsSchema),
    defaultValues: {
      full_name: binOwnerData.full_name || '',
      email: binOwnerData.email || '',
      phone_number: binOwnerData.phone_number || '',
      account_type: binOwnerData.account_type || 'individual',
      org_name: binOwnerData.org_name || '',
      address: binOwnerData.address || '',
      password: '',
      password_confirm: '',
    },
    mode: 'onChange',
  });

  // Set user type when component mounts
  useEffect(() => {
    setUserType('bin_owner');
    setCurrentStep(1);
  }, [setUserType, setCurrentStep]);

  const onSubmit = async (data: BinOwnerAccountBasicsForm) => {
    console.log('Form submitted with data:', data);
    console.log('Form is valid:', isValid);
    console.log('Form errors:', errors);

    try {
      // Update store with form data
      updateBinOwnerData({
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        account_type: data.account_type,
        org_name: data.org_name,
        address: data.address,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      // Always redirect to phone verification (simplified flow)
      setCurrentStep(2);
      setOtpSent(true);

      // Redirect to OTP verification page
      router.push('/auth/register/verify-phone?type=binowner&phone=' + encodeURIComponent(data.phone_number));
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };  return (
    <OnboardingLayout
      title="Create Your Bin Owner Account"
      subtitle="Step 1 of 2: Account Basics"
    >
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <Field label="Full Name" error={errors.full_name?.message}>
            <Input
              {...register('full_name')}
              placeholder="Enter your full name"
              error={errors.full_name?.message}
            />
          </Field>

          {/* Account Type */}
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

          {/* Organization Name (conditional) */}
          {watch('account_type') !== 'individual' && (
            <Field label="Organization Name" error={errors.org_name?.message}>
              <Input
                {...register('org_name')}
                placeholder="Enter organization name"
                error={errors.org_name?.message}
              />
            </Field>
          )}

          {/* Email */}
          <Field label="Email Address" error={errors.email?.message}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Mail" size={20} className="text-gray-500" />
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

          {/* Phone Number */}
          <Field
            label="Phone Number"
            error={errors.phone_number?.message}
            helperText="We'll send an SMS verification code to this number"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Smartphone" size={20} className="text-gray-500" />
              </div>
              <Input
                {...register('phone_number')}
                placeholder="+237 6XX XXX XXX"
                className="pl-10"
                error={errors.phone_number?.message}
              />
            </div>
          </Field>

          {/* Password */}
          <Field label="Password" error={errors.password?.message}>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Create a strong password"
                error={errors.password?.message}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Icon name="EyeOff" size={20} className="text-gray-500" />
                ) : (
                  <Icon name="Eye" size={20} className="text-gray-500" />
                )}
              </button>
            </div>
          </Field>
          <div className="mt-2 text-sm text-neutral-600">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          {/* Confirm Password */}
          <Field label="Confirm Password" error={errors.password_confirm?.message}>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('password_confirm')}
                placeholder="Confirm your password"
                error={errors.password_confirm?.message}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Icon name="EyeOff" size={20} className="text-gray-500" />
                ) : (
                  <Icon name="Eye" size={20} className="text-gray-500" />
                )}
              </button>
            </div>
          </Field>

          {/* Service Address */}
          <Field label="Service Address" error={errors.address?.message}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="MapPin" size={20} className="text-gray-500" />
              </div>
              <Input
                {...register('address')}
                placeholder="Street address, building name, apartment number, city, region"
                className="pl-10"
                error={errors.address?.message}
              />
            </div>
          </Field>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Icon name="Smartphone" size={20} style={{ color: '#2563EB' }} />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Phone Verification Required
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  We'll send you a verification code via SMS to confirm your phone number.
                  This helps keep our platform secure and ensures reliable waste collection services.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Account Type
            </button>

            <div className="flex flex-col items-end gap-2">
              {(!isValid && Object.keys(errors).length > 0) && (
                <p className="text-sm text-red-600">
                  Please fix the errors above to continue
                </p>
              )}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {isSubmitting ? 'Creating Account...' : 'Continue'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}