import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '../../../components/ui/Icons';
import OnboardingLayout from '../../../src/components/onboarding/OnboardingLayout';
import { otpVerificationSchema, type OTPVerificationForm } from '../../../src/schemas/registration';
import { useOnboardingStore } from '../../../src/stores/onboarding';
import { Input, Field } from '../../../src/design-system/components/Form';
import {
  OTP_SETTINGS,
  FORM_UI_SETTINGS,
  formatTimeRemaining,
  isValidOTP
} from '../../../src/config/formSettings';

export default function PhoneVerificationPage() {
  const router = useRouter();
  const {
    userType,
    workerData,
    binOwnerData,
    setPhoneVerified,
    setOtpVerified,
    nextStep
  } = useOnboardingStore();

  const [countdown, setCountdown] = useState<number>(OTP_SETTINGS.resendCooldown);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const phoneNumber = userType === 'worker' ? workerData.phone_number : binOwnerData.phone_number;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue
  } = useForm<OTPVerificationForm>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp_code: '',
    },
    mode: 'onChange',
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      // Here we would call the API to resend OTP
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setCountdown(60);
      setCanResend(false);
      alert('📱 Verification code "sent" successfully!\n\nFor testing, use: 123456');
    } catch (error) {
      alert('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: OTPVerificationForm) => {
    try {
      // Here we would verify the OTP with the backend
      console.log('Verifying OTP:', data.otp_code);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Test OTP codes for development
      const validTestCodes = ['123456', '000000', '111111', '999999'];

      if (!validTestCodes.includes(data.otp_code)) {
        throw new Error('Invalid OTP code');
      }

      // Mark phone as verified
      setPhoneVerified(true);
      setOtpVerified(true);

      // Navigate to welcome page based on user type (simplified flow)
      if (userType === 'worker') {
        nextStep();
        router.push('/auth/register/worker/welcome');
      } else {
        nextStep();
        router.push('/auth/register/bin-owner/welcome');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('Invalid verification code. Please try again. For testing, use: 123456');
    }
  };

  const handleBackToBasics = () => {
    if (userType === 'worker') {
      router.push('/auth/register/worker');
    } else {
      router.push('/auth/register/bin-owner');
    }
  };

  return (
    <OnboardingLayout
      title="Verify Your Phone Number"
      subtitle="We've sent a verification code to your phone"
      showBackButton={false}
    >
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Icon name="Shield" size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Check Your Messages
          </h2>
          <p className="text-neutral-600 mb-4">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-neutral-900 flex items-center justify-center gap-2">
            <Icon name="Smartphone" size={16} />
            {phoneNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* OTP Input */}
          <Field label="Verification Code" error={errors.otp_code?.message}>
            <Input
              {...register('otp_code')}
              placeholder={OTP_SETTINGS.otpPlaceholder}
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={OTP_SETTINGS.codeLength}
              autoComplete="one-time-code"
              error={errors.otp_code?.message}
            />
          </Field>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-4">
              Didn't receive the code?
            </p>

            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className={FORM_UI_SETTINGS.fieldClasses.button.secondary + " inline-flex items-center gap-2 text-sm"}
              >
                <Icon name="RefreshCw" size={16} className={isResending ? 'animate-spin' : ''} />
                {isResending ? FORM_UI_SETTINGS.loadingStates.resending : 'Resend Code'}
              </button>
            ) : (
              <p className="text-sm text-neutral-500">
                Resend code in {formatTimeRemaining(countdown)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleBackToBasics}
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-700 font-medium"
            >
              <Icon name="ArrowLeft" size={16} />
              Back to Account Info
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={FORM_UI_SETTINGS.fieldClasses.button.primary}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {FORM_UI_SETTINGS.loadingStates.verifying}
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 space-y-4">
          {/* Testing Notice */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              🧪 Testing Environment
            </h3>
            <p className="text-sm text-yellow-700 mb-2">
              This is a development environment. No real SMS will be sent.
            </p>
            <p className="text-sm text-yellow-700 font-mono bg-yellow-100 px-2 py-1 rounded">
              Use test code: <strong>{OTP_SETTINGS.testCode}</strong>
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-neutral-50 rounded-lg border">
            <h3 className="text-sm font-medium text-neutral-900 mb-2">
              Security Notice
            </h3>
            <p className="text-sm text-neutral-600">
              For your security, this verification code will expire in {OTP_SETTINGS.expiryMinutes} minutes.
              Never share this code with anyone else.
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}