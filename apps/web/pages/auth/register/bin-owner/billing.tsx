import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, DollarSign, Calendar } from 'lucide-react';
import { z } from 'zod';
import { Input, Label, Field } from '../../../../src/design-system/components/Form';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';

// Step 3: Billing Schema
const billingSchema = z.object({
  // Payment Method
  payment_method: z.enum(['momo', 'om', 'card', 'cash']),
  phone_payment: z.string().optional(),

  // Subscription
  subscription_plan: z.enum(['basic', 'standard', 'premium']),
  billing_cycle: z.enum(['monthly', 'quarterly', 'annual']),

  // Agreement
  terms_billing: z.boolean().refine(val => val === true, {
    message: 'You must agree to the billing terms'
  }),
});

type BillingForm = z.infer<typeof billingSchema>;

const paymentMethods = [
  { value: 'momo', label: 'Mobile Money (MTN)', icon: DollarSign, description: 'Pay with MTN Mobile Money' },
  { value: 'om', label: 'Orange Money', icon: DollarSign, description: 'Pay with Orange Money' },
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard accepted' },
  { value: 'cash', label: 'Cash on Service', icon: Calendar, description: 'Pay when service is provided' },
];

const subscriptionPlans = [
  {
    value: 'basic',
    label: 'Basic Plan',
    price: 'XAF 2,000/month',
    features: ['Weekly pickup', 'Standard bins', 'Basic support']
  },
  {
    value: 'standard',
    label: 'Standard Plan',
    price: 'XAF 5,000/month',
    features: ['Bi-weekly pickup', 'Multiple bin types', 'Priority support']
  },
  {
    value: 'premium',
    label: 'Premium Plan',
    price: 'XAF 8,000/month',
    features: ['Daily pickup', 'All bin types', '24/7 support', 'Special requests']
  },
];

export default function BinOwnerBillingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    binOwnerData,
    updateBinOwnerData,
    setCurrentStep
  } = useOnboardingStore();

  // Set current step
  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BillingForm>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      payment_method: binOwnerData?.payment_method || 'momo',
      phone_payment: binOwnerData?.phone_payment || '',
      subscription_plan: binOwnerData?.subscription_plan || 'basic',
      billing_cycle: binOwnerData?.billing_cycle || 'monthly',
      terms_billing: binOwnerData?.terms_billing || false,
    },
  });

  const selectedPaymentMethod = watch('payment_method');
  const selectedPlan = watch('subscription_plan');

  const onSubmit = async (data: BillingForm) => {
    setIsSubmitting(true);

    try {
      // Save data to store
      updateBinOwnerData(data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to phone verification
      router.push('/auth/register/verify-phone?type=binowner');
    } catch (error) {
      console.error('Billing setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      title="Billing & Subscription"
      subtitle="Choose your payment method and subscription plan"
      showBackButton={true}
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
            Payment Method
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.value}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={method.value}
                    {...register('payment_method')}
                    className="sr-only"
                  />
                  <Icon className={`w-6 h-6 ${
                    selectedPaymentMethod === method.value ? 'text-blue-600' : 'text-neutral-400'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      selectedPaymentMethod === method.value ? 'text-blue-900' : 'text-neutral-900'
                    }`}>
                      {method.label}
                    </h4>
                    <p className="text-sm text-neutral-600">{method.description}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Phone number for mobile money */}
          {(selectedPaymentMethod === 'momo' || selectedPaymentMethod === 'om') && (
            <Field label="Mobile Money Phone Number" error={errors.phone_payment?.message}>
              <Input
                {...register('phone_payment')}
                placeholder="+237 6XX XXX XXX"
                error={errors.phone_payment?.message}
              />
            </Field>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
            Subscription Plan
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {subscriptionPlans.map((plan) => (
              <label
                key={plan.value}
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPlan === plan.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  value={plan.value}
                  {...register('subscription_plan')}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-medium ${
                      selectedPlan === plan.value ? 'text-blue-900' : 'text-neutral-900'
                    }`}>
                      {plan.label}
                    </h4>
                    <span className="text-lg font-bold text-blue-600">{plan.price}</span>
                  </div>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
            Billing Cycle
          </h3>

          <Field error={errors.billing_cycle?.message}>
            <select
              {...register('billing_cycle')}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly - Pay every month</option>
              <option value="quarterly">Quarterly - Pay every 3 months (5% discount)</option>
              <option value="annual">Annual - Pay yearly (15% discount)</option>
            </select>
          </Field>
        </div>

        {/* Terms Agreement */}
        <div className="space-y-4">
          <Field error={errors.terms_billing?.message}>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register('terms_billing')}
                className="mt-1 w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
              />
              <div className="text-sm">
                <span className="text-neutral-700">
                  I agree to the{' '}
                  <a href="/terms/billing" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                    billing terms and conditions
                  </a>{' '}
                  and understand that my subscription will auto-renew unless cancelled.
                </span>
                {errors.terms_billing && (
                  <p className="text-red-600 text-xs mt-1">{errors.terms_billing.message}</p>
                )}
              </div>
            </label>
          </Field>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Setting up...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}