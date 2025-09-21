import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Building, User, DollarSign } from 'lucide-react';
import { z } from 'zod';
import { Input, Label, Field } from '../../../../src/design-system/components/Form';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';

// Step 4: Earnings Setup Schema
const workerEarningsSchema = z.object({
  // Payment Information
  payment_method: z.enum(['mobile_money', 'bank_transfer', 'cash'], {
    message: 'Please select a payment method',
  }),

  // Mobile Money (MTN, Orange)
  mobile_money_number: z.string().optional(),
  mobile_money_provider: z.enum(['mtn', 'orange']).optional(),

  // Bank Details
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_name: z.string().optional(),

  // Tax Information
  tax_id: z.string().optional(),
  tax_residence: z.string().min(1, 'Tax residence is required'),

  // Emergency Contact
  emergency_contact_name: z.string().min(2, 'Emergency contact name is required'),
  emergency_contact_phone: z.string().min(9, 'Emergency contact phone is required'),
  emergency_contact_relation: z.string().min(1, 'Relationship is required'),
}).refine((data) => {
  // If mobile money is selected, require mobile money details
  if (data.payment_method === 'mobile_money') {
    return data.mobile_money_number && data.mobile_money_provider;
  }
  // If bank transfer is selected, require bank details
  if (data.payment_method === 'bank_transfer') {
    return data.bank_name && data.account_number && data.account_name;
  }
  return true;
}, {
  message: "Please complete the required payment details",
  path: ["payment_method"],
});

type WorkerEarningsForm = z.infer<typeof workerEarningsSchema>;

const paymentOptions = [
  {
    value: 'mobile_money',
    label: 'Mobile Money',
    icon: CreditCard,
    description: 'MTN Mobile Money, Orange Money'
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: Building,
    description: 'Direct bank account transfer'
  },
  {
    value: 'cash',
    label: 'Cash Payment',
    icon: DollarSign,
    description: 'Cash pickup at office location'
  },
];

const mobileMoneyProviders = [
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'orange', label: 'Orange Money' },
];

export default function WorkerEarningsPage() {
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const { workerData, updateWorkerData, nextStep, setCurrentStep } = useOnboardingStore();

  // Set current step
  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
  } = useForm<WorkerEarningsForm>({
    resolver: zodResolver(workerEarningsSchema),
    defaultValues: {
      payment_method: workerData?.payment_method || undefined,
      mobile_money_number: workerData?.mobile_money_number || '',
      mobile_money_provider: workerData?.mobile_money_provider || undefined,
      bank_name: workerData?.bank_name || '',
      account_number: workerData?.account_number || '',
      account_name: workerData?.account_name || '',
      tax_id: workerData?.tax_id || '',
      tax_residence: workerData?.tax_residence || 'Cameroon',
      emergency_contact_name: workerData?.emergency_contact_name || '',
      emergency_contact_phone: workerData?.emergency_contact_phone || '',
      emergency_contact_relation: workerData?.emergency_contact_relation || '',
    },
  });

  // Watch payment method changes
  const watchedPaymentMethod = watch('payment_method');

  useEffect(() => {
    setSelectedPaymentMethod(watchedPaymentMethod || '');
  }, [watchedPaymentMethod]);

  const onSubmit = async (data: WorkerEarningsForm) => {
    try {
      console.log('Worker Earnings Form Data:', data);

      // Update store with form data
      updateWorkerData({
        payment_method: data.payment_method,
        mobile_money_number: data.mobile_money_number,
        mobile_money_provider: data.mobile_money_provider,
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_name: data.account_name,
        tax_id: data.tax_id,
        tax_residence: data.tax_residence,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
      });

      // Move to next step (confirmation)
      nextStep();
      router.push('/auth/register/worker/confirmation');
    } catch (error) {
      console.error('Earnings setup error:', error);
    }
  };

  // Auto-save form data as user types
  const watchedFields = watch();
  useEffect(() => {
    const subscription = watch((value) => {
      updateWorkerData(value as any);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateWorkerData]);

  return (
    <OnboardingLayout
      title="Earnings Setup"
      subtitle="Set up your payment preferences and tax information"
      showBackButton={true}
      showCloseButton={true}
    >
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
            Payment Method
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('payment_method')}
                    value={option.value}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg ${
                    selectedPaymentMethod === option.value
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{option.label}</div>
                    <div className="text-sm text-neutral-600">{option.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.payment_method && (
            <p className="text-sm text-red-600">{errors.payment_method.message}</p>
          )}
        </div>

        {/* Mobile Money Details */}
        {selectedPaymentMethod === 'mobile_money' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Mobile Money Details
            </h3>

            <Field label="Mobile Money Provider" error={errors.mobile_money_provider?.message}>
              <select
                {...register('mobile_money_provider')}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select provider</option>
                {mobileMoneyProviders.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Mobile Money Number" error={errors.mobile_money_number?.message}>
              <Input
                {...register('mobile_money_number')}
                placeholder="6XX XXX XXX"
                error={errors.mobile_money_number?.message}
              />
            </Field>
          </div>
        )}

        {/* Bank Details */}
        {selectedPaymentMethod === 'bank_transfer' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Bank Details
            </h3>

            <Field label="Bank Name" error={errors.bank_name?.message}>
              <Input
                {...register('bank_name')}
                placeholder="e.g., Commercial Bank of Cameroon"
                error={errors.bank_name?.message}
              />
            </Field>

            <Field label="Account Number" error={errors.account_number?.message}>
              <Input
                {...register('account_number')}
                placeholder="Your account number"
                error={errors.account_number?.message}
              />
            </Field>

            <Field label="Account Holder Name" error={errors.account_name?.message}>
              <Input
                {...register('account_name')}
                placeholder="Name as it appears on bank account"
                error={errors.account_name?.message}
              />
            </Field>
          </div>
        )}

        {/* Tax Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
            Tax Information
          </h3>

          <Field label="Tax Residence" error={errors.tax_residence?.message}>
            <Input
              {...register('tax_residence')}
              placeholder="Country of tax residence"
              error={errors.tax_residence?.message}
            />
          </Field>

          <Field label="Tax ID (Optional)" error={errors.tax_id?.message}>
            <Input
              {...register('tax_id')}
              placeholder="Your tax identification number"
              error={errors.tax_id?.message}
            />
          </Field>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
            Emergency Contact
          </h3>

          <Field label="Contact Name" error={errors.emergency_contact_name?.message}>
            <Input
              {...register('emergency_contact_name')}
              placeholder="Full name of emergency contact"
              error={errors.emergency_contact_name?.message}
            />
          </Field>

          <Field label="Contact Phone" error={errors.emergency_contact_phone?.message}>
            <Input
              {...register('emergency_contact_phone')}
              placeholder="+237 6XX XXX XXX"
              error={errors.emergency_contact_phone?.message}
            />
          </Field>

          <Field label="Relationship" error={errors.emergency_contact_relation?.message}>
            <select
              {...register('emergency_contact_relation')}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select relationship</option>
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="relative">Other Relative</option>
            </select>
          </Field>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            {isSubmitting ? 'Saving...' : 'Continue to Review'}
          </button>
        </div>
      </form>
      </div>
    </OnboardingLayout>
  );
}