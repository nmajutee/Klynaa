import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '../../components/ui/Icons';
import Link from 'next/link';
import { Input, Field } from '../../src/design-system/components/Form';
import { FORM_VALIDATION, FORM_UI_SETTINGS } from '../../src/config/formSettings';

// Validation schema for password reset
const resetPasswordSchema = z.object({
  password: z.string()
    .min(FORM_VALIDATION.password.minLength, FORM_VALIDATION.password.message)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, FORM_VALIDATION.password.message),
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  // Validate token on mount
  useEffect(() => {
    if (token) {
      validateResetToken(token as string);
    }
  }, [token]);

  const validateResetToken = async (resetToken: string) => {
    try {
      // Simulate token validation
      console.log('Validating reset token:', resetToken);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any token except 'invalid'
      const isValid = resetToken !== 'invalid';
      setIsValidToken(isValid);
    } catch (error) {
      console.error('Token validation error:', error);
      setIsValidToken(false);
    }
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      console.log('Password reset for token:', token, 'New password set');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  // Loading state while validating token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="AlertCircle" size={32} className="text-red-600" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Invalid Reset Link
              </h1>
              <p className="text-neutral-600 mb-4">
                This password reset link has expired or is invalid.
              </p>
              <p className="text-sm text-neutral-500">
                Please request a new password reset link.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/auth/forgot-password"
                className={`block w-full text-center ${FORM_UI_SETTINGS.fieldClasses.button.primary}`}
              >
                Request New Reset Link
              </Link>

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

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={32} className="text-emerald-600" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Password Reset Successful!
              </h1>
              <p className="text-neutral-600 mb-4">
                Your password has been successfully updated.
              </p>
              <p className="text-sm text-neutral-500">
                You will be redirected to the sign in page shortly.
              </p>
            </div>

            <Link
              href="/auth/login"
              className={`block w-full text-center ${FORM_UI_SETTINGS.fieldClasses.button.primary}`}
            >
              Continue to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Icon name="Lock" size={24} className="text-emerald-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-neutral-600">
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <Field label="New Password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Create a strong password"
                  className="pr-10"
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Icon name="EyeOff" size={20} /> : <Icon name="Eye" size={20} />}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm New Password" error={errors.password_confirm?.message}>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('password_confirm')}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  error={errors.password_confirm?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <Icon name="EyeOff" size={20} /> : <Icon name="Eye" size={20} />}
                </button>
              </div>
            </Field>

            {/* Password Requirements */}
            <div className="p-4 bg-neutral-50 rounded-lg">
              <h4 className="text-sm font-medium text-neutral-900 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• At least {FORM_VALIDATION.password.minLength} characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full ${FORM_UI_SETTINGS.fieldClasses.button.primary}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>

          {/* Development Notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                🧪 Development Environment
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                This is a mock password reset flow. Token validation is simulated.
              </p>
              <p className="text-xs text-yellow-600">
                Use any token except 'invalid' to test the flow.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}