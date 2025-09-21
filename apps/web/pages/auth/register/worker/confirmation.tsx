import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, User, Phone, MapPin, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';

export default function WorkerConfirmationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { workerData, setCurrentStep, clearWorkerData } = useOnboardingStore();

  // Set current step
  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const handleCompleteRegistration = async () => {
    setIsSubmitting(true);

    try {
      console.log('Final Worker Registration Data:', workerData);

      // Simulate API call to submit registration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear registration data
      clearWorkerData();

      // Redirect to success page or login
      router.push('/auth/login?message=registration_complete');
    } catch (error) {
      console.error('Registration completion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'mobile_money':
        return 'Mobile Money';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash Payment';
      default:
        return 'Not specified';
    }
  };

  const formatAvailability = (schedule?: string[]) => {
    if (!schedule || schedule.length === 0) return 'Not specified';
    return schedule.map(s => s.replace('_', ' ')).join(', ');
  };

  return (
    <OnboardingLayout
      title="Review & Confirm"
      subtitle="Please review your information before completing registration"
      showBackButton={true}
      showCloseButton={false}
    >
      <div className="p-8">
        <div className="space-y-8">
        {/* Registration Summary */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900">
              Registration Almost Complete!
            </h3>
          </div>
          <p className="text-emerald-700 text-sm">
            Your worker account is ready for final submission. Please review the information below and click "Complete Registration" to finish.
          </p>
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-neutral-700">Full Name:</span>
              <p className="text-neutral-900">{workerData?.full_name || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">Email:</span>
              <p className="text-neutral-900">{workerData?.email || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">Phone:</span>
              <p className="text-neutral-900">{workerData?.phone_number || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">ID Number:</span>
              <p className="text-neutral-900">{workerData?.id_number || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Profile & Availability
          </h3>

          <div className="grid grid-cols-1 gap-4 text-sm">
            <div>
              <span className="font-medium text-neutral-700">Address:</span>
              <p className="text-neutral-900">{workerData?.address || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">Availability:</span>
              <p className="text-neutral-900">{formatAvailability(workerData?.availability_schedule)}</p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment & Tax
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-neutral-700">Payment Method:</span>
              <p className="text-neutral-900">{formatPaymentMethod(workerData?.payment_method)}</p>
            </div>
            {workerData?.payment_method === 'mobile_money' && (
              <>
                <div>
                  <span className="font-medium text-neutral-700">Provider:</span>
                  <p className="text-neutral-900">{workerData?.mobile_money_provider?.toUpperCase() || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Mobile Number:</span>
                  <p className="text-neutral-900">{workerData?.mobile_money_number || 'Not provided'}</p>
                </div>
              </>
            )}
            {workerData?.payment_method === 'bank_transfer' && (
              <>
                <div>
                  <span className="font-medium text-neutral-700">Bank:</span>
                  <p className="text-neutral-900">{workerData?.bank_name || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Account:</span>
                  <p className="text-neutral-900">{workerData?.account_number || 'Not provided'}</p>
                </div>
              </>
            )}
            <div>
              <span className="font-medium text-neutral-700">Tax Residence:</span>
              <p className="text-neutral-900">{workerData?.tax_residence || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Emergency Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-neutral-700">Contact Name:</span>
              <p className="text-neutral-900">{workerData?.emergency_contact_name || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">Contact Phone:</span>
              <p className="text-neutral-900">{workerData?.emergency_contact_phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">Relationship:</span>
              <p className="text-neutral-900">{workerData?.emergency_contact_relation || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-amber-900 mb-1">Account Review Process</h4>
              <p className="text-amber-700">
                Your account will be reviewed within 24-48 hours. You'll receive an email notification once approved.
                Documents uploaded will be verified for authenticity and completeness.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
          <button
            onClick={() => router.push('/auth/register/worker/earnings')}
            className="px-6 py-3 text-neutral-600 hover:text-neutral-900 font-medium"
            disabled={isSubmitting}
          >
            Go Back
          </button>

          <button
            onClick={handleCompleteRegistration}
            disabled={isSubmitting}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete Registration
              </>
            )}
          </button>
        </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}