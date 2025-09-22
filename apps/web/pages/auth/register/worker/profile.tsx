import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';
import { workerProfileSchema, type WorkerProfileForm } from '../../../../src/schemas/registration';
import { Input, Label, Field, TextArea } from '../../../../src/design-system/components/Form';
import { Icon } from '../../../../components/ui/Icons';

export default function WorkerProfilePage() {
  const router = useRouter();
  const { workerData, updateWorkerData, nextStep, prevStep } = useOnboardingStore();

  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const availabilityOptions = [
    { value: 'morning', label: 'Morning (6AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
    { value: 'evening', label: 'Evening (6PM - 9PM)' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'flexible', label: 'Flexible Schedule' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch
  } = useForm<WorkerProfileForm>({
    resolver: zodResolver(workerProfileSchema),
    defaultValues: {
      id_number: workerData.id_number || '',
      date_of_birth: workerData.date_of_birth || '',
      address: workerData.address || '',
      availability_schedule: workerData.availability_schedule || [],
    },
    mode: 'onChange',
  });

  const watchedAvailability = watch('availability_schedule') || [];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('profile_photo', file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvailabilityChange = (value: string) => {
    const current = watchedAvailability;
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setValue('availability_schedule', updated);
  };

  const onSubmit = async (data: WorkerProfileForm) => {
    try {
      // Update store with form data
      updateWorkerData({
        id_number: data.id_number,
        profile_photo: data.profile_photo,
        date_of_birth: data.date_of_birth,
        address: data.address,
        availability_schedule: data.availability_schedule,
      });

      // Move to next step
      nextStep();
      router.push('/auth/register/worker/verification');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <OnboardingLayout
      title="Worker Profile Setup"
      subtitle="Step 2 of 5: Tell us about yourself"
    >
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden bg-neutral-50">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                >
                  <Icon name="Upload" className="w-4 h-4" />
                  Upload Photo
                </button>
                <p className="text-xs text-neutral-500 mt-1">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* ID Number */}
          <Field label="National ID / Passport Number" error={errors.id_number?.message}>
            <Input
              {...register('id_number')}
              placeholder="Enter your ID or passport number"
              error={errors.id_number?.message}
            />
          </Field>

          {/* Date of Birth */}
          <Field label="Date of Birth" error={errors.date_of_birth?.message}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="Calendar" className="h-5 w-5 text-neutral-400" />
              </div>
              <Input
                type="date"
                {...register('date_of_birth')}
                className="pl-10"
                error={errors.date_of_birth?.message}
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
          </Field>
          <p className="text-sm text-neutral-500 -mt-4">
            You must be at least 18 years old to work as a waste collector.
          </p>

          {/* Address */}
          <Field label="Address / Area of Operation" error={errors.address?.message}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="MapPin" className="h-5 w-5 text-neutral-400" />
              </div>
              <TextArea
                {...register('address')}
                placeholder="Enter your full address and preferred working area"
                className="pl-10"
                rows={3}
                error={errors.address?.message}
              />
            </div>
          </Field>

          {/* Availability Schedule */}
          <div className="space-y-2">
            <Label>Availability Schedule</Label>
            <p className="text-xs text-neutral-500">Select all time periods when you're available to work</p>
            {errors.availability_schedule && (
              <p className="text-xs text-error-600">{errors.availability_schedule.message}</p>
            )}
            <div className="space-y-3">
              {availabilityOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={watchedAvailability.includes(option.value)}
                    onChange={() => handleAvailabilityChange(option.value)}
                    className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <Icon name="Clock" className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-neutral-900">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Information Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Icon name="User" className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-emerald-800">
                  Profile Verification
                </h3>
                <p className="mt-1 text-sm text-emerald-700">
                  Your profile information will be reviewed to ensure the safety and trust
                  of our community. This helps customers feel confident when booking your services.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={prevStep}
              className="text-neutral-600 hover:text-neutral-700 font-medium"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              {isSubmitting ? 'Saving...' : 'Continue to Verification'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}