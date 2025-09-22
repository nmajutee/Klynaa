import React from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../../../components/ui/Icons';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';

export default function BinOwnerWelcomePage() {
  const router = useRouter();
  const { binOwnerData, resetOnboarding } = useOnboardingStore();

  const handleContinueToDashboard = () => {
    // In a real app, you'd create the account here
    console.log('Creating bin owner account with data:', binOwnerData);

    // Clear onboarding data and redirect to dashboard
    resetOnboarding();
    router.push('/bin-owner/dashboard');
  };

  const handleSetupServiceLater = () => {
    // Direct to dashboard with setup pending status
    resetOnboarding();
    router.push('/bin-owner/dashboard?setup=pending');
  };

  return (
    <OnboardingLayout
      title="Welcome to Klynaa!"
      subtitle="Your account has been created successfully"
      showBackButton={false}
      showCloseButton={false}
    >
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Icon name="CheckCircle" className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-neutral-600">
            Welcome to Klynaa, {binOwnerData.full_name}!
          </p>
        </div>

        {/* Account Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="CheckCircle" className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              Basic Account Active
            </h3>
          </div>
          <p className="text-blue-700 text-sm mb-4">
            You can now explore our services and pricing. To schedule waste collection, you'll need to complete your service setup.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="CheckCircle" className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700">Phone number verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="CheckCircle" className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700">Basic profile created</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Settings" className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900">
              Complete Service Setup to Start Collection
            </h3>
          </div>
          <p className="text-orange-700 text-sm mb-4">
            To schedule waste collection and manage your service, complete these setup steps:
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Icon name="MapPin" className="w-4 h-4 text-orange-600" />
              <span className="text-orange-700">Service Address & Location</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Icon name="Trash2" className="w-4 h-4 text-orange-600" />
              <span className="text-orange-700">Bin Type & Collection Schedule</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Icon name="CreditCard" className="w-4 h-4 text-orange-600" />
              <span className="text-orange-700">Payment Method & Billing</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleContinueToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="Trash2" className="w-5 h-5" />
            Go to Dashboard
            <Icon name="ArrowRight" className="w-5 h-5" />
          </button>

          <div className="text-center">
            <button
              onClick={handleSetupServiceLater}
              className="text-neutral-600 hover:text-neutral-900 font-medium text-sm"
            >
              I'll setup my service later
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600">
            Need help setting up your service?{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-700">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}