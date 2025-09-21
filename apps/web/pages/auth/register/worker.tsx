import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Phone } from 'lucide-react';
import { useOnboardingStore } from '../../../src/stores/onboarding';
import OnboardingLayout from '../../../src/components/onboarding/OnboardingLayout';
import { workerAccountBasicsSchema, type WorkerAccountBasicsForm } from '../../../src/schemas/registration';
import { Input, Label, Field } from '../../../src/design-system/components/Form';

export default function WorkerRegistrationPage() {
  const router = useRouter();
  const {
    setUserType,
    workerData,
    updateWorkerData,
    nextStep,
    phoneVerified,
    setOtpSent
  } = useOnboardingStore();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch
  } = useForm<WorkerAccountBasicsForm>({
    resolver: zodResolver(workerAccountBasicsSchema),
    defaultValues: {
      full_name: workerData.full_name || '',
      email: workerData.email || '',
      phone_number: workerData.phone_number || '',
      password: '',
      password_confirm: '',
    },
    mode: 'onChange',
  });

  // Set user type when component mounts
  useEffect(() => {
    setUserType('worker');
  }, [setUserType]);

  const onSubmit = async (data: WorkerAccountBasicsForm) => {
    console.log('Form submitted with data:', data);
    console.log('Form is valid:', isValid);
    console.log('Form errors:', errors);

    try {
      // Update store with form data
      updateWorkerData({
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      console.log('Data updated in store');

      // If phone not verified, trigger OTP
      if (!phoneVerified) {
        // Here we would call API to send OTP
        console.log('Phone not verified, redirecting to verification');
        setOtpSent(true);
        // Redirect to OTP verification page
        router.push('/auth/register/verify-phone?type=worker');
      } else {
        // Move to next step
        console.log('Phone verified, moving to profile');
        nextStep();
        router.push('/auth/register/worker/profile');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <OnboardingLayout
      title="Create Your Worker Account"
      subtitle="Step 1 of 5: Account Basics"
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

          {/* Email */}
          <Field label="Email Address" error={errors.email?.message}>
            <Input
              type="email"
              {...register('email')}
              placeholder="Enter your email address"
              error={errors.email?.message}
            />
          </Field>

          {/* Phone Number */}
          <Field
            label="Phone Number"
            error={errors.phone_number?.message}
            helperText="We'll send an SMS verification code to this number"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-neutral-400" />
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
                  <EyeOff className="h-5 w-5 text-neutral-400" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400" />
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
                  <EyeOff className="h-5 w-5 text-neutral-400" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400" />
                )}
              </button>
            </div>
          </Field>

          {/* Privacy Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Phone className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-emerald-800">
                  Phone Verification Required
                </h3>
                <p className="mt-1 text-sm text-emerald-700">
                  We'll send you a verification code via SMS to confirm your phone number.
                  This helps keep our platform secure and allows customers to contact you safely.
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Back to Account Type
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              onClick={() => console.log('Button clicked', { isValid, isSubmitting, errors })}
            >
              {isSubmitting ? 'Creating Account...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}