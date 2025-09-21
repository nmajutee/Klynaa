import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, MapPin, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { Input, Label, Field } from '../../../../src/design-system/components/Form';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';

// Step 2: Service Details Schema
const binOwnerDetailsSchema = z.object({
  // Bin Configuration
  bin_type: z.enum(['residential', 'commercial', 'industrial']),
  bin_count: z.number().min(1, 'At least 1 bin is required').max(50, 'Maximum 50 bins allowed'),
  pickup_frequency: z.enum(['daily', 'weekly', 'bi_weekly', 'monthly']),

  // Location Details (optional - can be added later)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location_notes: z.string().optional(),
});

type BinOwnerDetailsForm = z.infer<typeof binOwnerDetailsSchema>;

const binTypeOptions = [
  { value: 'residential', label: 'Residential', icon: Home, description: 'Home, apartment, residential building' },
  { value: 'commercial', label: 'Commercial', icon: Trash2, description: 'Office, shop, restaurant, hotel' },
  { value: 'industrial', label: 'Industrial', icon: MapPin, description: 'Factory, warehouse, manufacturing' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily', description: 'Every day pickup', price: 'XAF 3,000/month' },
  { value: 'weekly', label: 'Weekly', description: 'Once per week', price: 'XAF 8,000/month' },
  { value: 'bi_weekly', label: 'Bi-weekly', description: 'Twice per month', price: 'XAF 5,000/month' },
  { value: 'monthly', label: 'Monthly', description: 'Once per month', price: 'XAF 2,000/month' },
];

export default function BinOwnerDetailsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUserType, setCurrentStep, binOwnerData, updateBinOwnerData } = useOnboardingStore();

  // Set user type and step when component mounts
  useEffect(() => {
    setUserType('bin_owner');
    setCurrentStep(2);
  }, [setUserType, setCurrentStep]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<BinOwnerDetailsForm>({
    resolver: zodResolver(binOwnerDetailsSchema),
    defaultValues: {
      bin_type: binOwnerData?.bin_type || 'residential',
      bin_count: binOwnerData?.bin_count || 1,
      pickup_frequency: binOwnerData?.pickup_frequency || 'weekly',
      latitude: binOwnerData?.latitude,
      longitude: binOwnerData?.longitude,
      location_notes: '',
    },
  });

  const selectedBinType = watch('bin_type');
  const selectedFrequency = watch('pickup_frequency');

  const onSubmit = async (data: BinOwnerDetailsForm) => {
    console.log('🔥 Bin Owner Details Submit - Data:', data);
    console.log('🔥 Form validation errors:', errors);

    setIsSubmitting(true);

    try {
      // Save data to store
      updateBinOwnerData(data);

      // Move to next step
      setCurrentStep(3);

      console.log('🔥 Details saved, moving to billing...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to billing setup
      router.push('/auth/register/bin-owner/billing');
    } catch (error) {
      console.error('Details save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };  // Auto-save form data as user types
  const watchedFields = watch();
  useEffect(() => {
    const subscription = watch((value) => {
      updateBinOwnerData(value as any);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateBinOwnerData]);

  return (
    <OnboardingLayout
      title="Service Details"
      subtitle="Configure your waste collection requirements"
      showBackButton={true}
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Bin Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
                Service Type
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {binTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedBinType === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('bin_type')}
                        value={option.value}
                        className="sr-only"
                      />
                      <Icon className={`w-6 h-6 mt-1 ${
                        selectedBinType === option.value ? 'text-blue-600' : 'text-neutral-400'
                      }`} />
                      <div>
                        <h4 className="font-medium text-neutral-900">{option.label}</h4>
                        <p className="text-sm text-neutral-600">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.bin_type && (
                <p className="text-sm text-red-600">{errors.bin_type.message}</p>
              )}
            </div>

            {/* Bin Count */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
                Number of Bins
              </h3>

              <Field label="How many waste bins do you need?" error={errors.bin_count?.message}>
                <div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const currentValue = watch('bin_count');
                        if (currentValue > 1) {
                          setValue('bin_count', currentValue - 1);
                        }
                      }}
                      className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center text-xl font-semibold hover:bg-neutral-50"
                    >
                      −
                    </button>

                    <Input
                      type="number"
                      {...register('bin_count', { valueAsNumber: true })}
                      min={1}
                      max={50}
                      className="text-center w-20"
                      error={errors.bin_count?.message}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const currentValue = watch('bin_count');
                        if (currentValue < 50) {
                          setValue('bin_count', currentValue + 1);
                        }
                      }}
                      className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center text-xl font-semibold hover:bg-neutral-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2">
                    Standard bins are 120L capacity. Additional bins can be added later.
                  </p>
                </div>
              </Field>
            </div>

            {/* Pickup Frequency */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
                Pickup Schedule
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frequencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFrequency === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('pickup_frequency')}
                      value={option.value}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {option.label}
                      </h4>
                      <span className={`text-sm font-semibold ${
                        selectedFrequency === option.value ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {option.price}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">{option.description}</p>
                  </label>
                ))}
              </div>
              {errors.pickup_frequency && (
                <p className="text-sm text-red-600">{errors.pickup_frequency.message}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
                Additional Information
              </h3>

              <Field label="Location Notes (Optional)">
                <textarea
                  {...register('location_notes')}
                  placeholder="Any specific instructions for our collectors? (e.g., gate access, parking, special requirements)"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </Field>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-neutral-200">
              <Link
                href="/auth/register/bin-owner"
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Back
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Billing'}
              </button>
            </div>
          </form>
      </OnboardingLayout>
    );
}