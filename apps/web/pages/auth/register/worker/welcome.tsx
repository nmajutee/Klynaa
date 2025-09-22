import React from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../../../components/ui/Icons';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';
import { useAuth } from '../../../../src/contexts/AuthContext';

export default function WorkerWelcomePage() {
  const router = useRouter();
  const { workerData, resetOnboarding } = useOnboardingStore();
  const { login } = useAuth();

  const handleContinueToDashboard = () => {
    // In a real app, you'd create the account here and get auth token
    console.log('Creating worker account with data:', workerData);

    // Simulate successful account creation by setting auth state
    const mockWorkerUser = {
      id: Date.now().toString(),
      email: workerData.email || 'worker@klynaa.com',
      name: workerData.full_name || 'New Worker',
      role: 'worker' as const
    };

    // Generate mock token
    const mockToken = `token_${mockWorkerUser.id}_${Date.now()}`;

    // Use AuthContext to log in the user
    login(mockWorkerUser, mockToken);

    // Clear onboarding data and redirect to dashboard
    resetOnboarding();
    router.push('/worker/dashboard');
  };

  const handleCompleteVerificationLater = () => {
    // Create limited access account
    const mockWorkerUser = {
      id: Date.now().toString(),
      email: workerData.email || 'worker@klynaa.com',
      name: workerData.full_name || 'New Worker',
      role: 'worker' as const,
      verification_status: 'pending' as const
    };

    // Generate mock token
    const mockToken = `token_${mockWorkerUser.id}_${Date.now()}`;

    // Use AuthContext to log in the user with verification pending
    login(mockWorkerUser, mockToken);

    // Clear onboarding data and redirect to dashboard with pending status
    resetOnboarding();
    router.push('/worker/dashboard?verification=pending');
  };

  return (
    <OnboardingLayout
      title="Welcome to Klynaa!"
      subtitle="Your worker account has been created successfully"
      showBackButton={false}
      showCloseButton={false}
    >
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Icon name="CheckCircle" size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-neutral-600">
            Welcome to the Klynaa community, {workerData.full_name}!
          </p>
        </div>

        {/* Account Status */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="CheckCircle" size={20} className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900">
              Basic Account Active
            </h3>
          </div>
          <p className="text-emerald-700 text-sm mb-4">
            You can now explore the platform and see available jobs. To start accepting jobs, you'll need to complete your verification.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="CheckCircle" size={16} className="text-emerald-600" />
              <span className="text-emerald-700">Phone number verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="CheckCircle" size={16} className="text-emerald-600" />
              <span className="text-emerald-700">Basic profile created</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Shield" size={20} style={{ color: '#EA580C' }} />
            <h3 className="text-lg font-semibold text-orange-900">
              Complete Verification to Start Working
            </h3>
          </div>
          <p className="text-orange-700 text-sm mb-4">
            To accept jobs and receive payments, complete these additional steps:
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Icon name="User" size={16} style={{ color: '#EA580C' }} />
              <span className="text-orange-700">ID Verification & Profile Details</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Icon name="Shield" size={16} style={{ color: '#EA580C' }} />
              <span className="text-orange-700">Document Verification</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Icon name="CreditCard" size={16} style={{ color: '#EA580C' }} />
              <span className="text-orange-700">Payment Information</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleContinueToDashboard}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Briefcase" size={20} />
            Go to Dashboard
            <Icon name="ArrowRight" size={20} />
          </button>

          <div className="text-center">
            <button
              onClick={handleCompleteVerificationLater}
              className="text-neutral-600 hover:text-neutral-900 font-medium text-sm"
            >
              I'll complete verification later
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600">
            Questions about verification?{' '}
            <a href="/support" className="text-emerald-600 hover:text-emerald-700">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}