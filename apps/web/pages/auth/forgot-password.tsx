import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '../../components/ui/Icons';
import Link from 'next/link';
import { Input, Field } from '../../src/design-system/components/Form';
import { FORM_VALIDATION, FORM_UI_SETTINGS } from '../../src/config/formSettings';

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email(FORM_VALIDATION.email.message),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange'
  });

  const emailValue = watch('email');

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      // Simulate API call
      console.log('Password reset requested for:', data.email);

      // In production, this would call your password reset API
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      // Handle error - show toast notification, etc.
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={32} className="text-emerald-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Check Your Email
              </h1>
              <p className="text-neutral-600 mb-4">
                We've sent password reset instructions to:
              </p>
              <p className="font-semibold text-neutral-900 flex items-center justify-center gap-2 mb-4">
                <Icon name="Mail" size={16} />
                {emailValue}
              </p>
              <p className="text-sm text-neutral-500">
                If you don't see the email, check your spam folder.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className={`w-full ${FORM_UI_SETTINGS.fieldClasses.button.secondary} text-center py-3 rounded-lg`}
              >
                Didn't receive the email? Try again
              </button>

              <Link
                href="/auth/login"
                className="block w-full text-center py-3 text-neutral-600 hover:text-neutral-800 font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-neutral-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field label="Email Address" error={errors.email?.message}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Mail" size={20} className="text-gray-500" />
                </div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10"
                  error={errors.email?.message}
                />
              </div>
            </Field>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full ${FORM_UI_SETTINGS.fieldClasses.button.primary}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Instructions...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-800 font-medium"
            >
              <Icon name="ArrowLeft" size={16} />
              Back to Sign In
            </Link>
          </div>

          {/* Development Notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                🧪 Development Environment
              </h3>
              <p className="text-sm text-yellow-700">
                This is a mock password reset flow. In production, this would integrate with your email service and backend API.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}