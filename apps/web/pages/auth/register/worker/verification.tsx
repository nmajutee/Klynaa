import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOnboardingStore } from '../../../../src/stores/onboarding';
import OnboardingLayout from '../../../../src/components/onboarding/OnboardingLayout';
import { workerVerificationSchema, type WorkerVerificationForm } from '../../../../src/schemas/registration';
import { Label, Field } from '../../../../src/design-system/components/Form';

type FileUploadState = {
  file: File | null;
  preview: string | null;
  error: string | null;
  uploading: boolean;
};

export default function WorkerVerificationPage() {
  const router = useRouter();
  const { workerData, updateWorkerData, nextStep, prevStep } = useOnboardingStore();

  const [idDocumentState, setIdDocumentState] = useState<FileUploadState>({
    file: null,
    preview: null,
    error: null,
    uploading: false,
  });

  const [clearanceState, setClearanceState] = useState<FileUploadState>({
    file: null,
    preview: null,
    error: null,
    uploading: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch
  } = useForm<WorkerVerificationForm>({
    resolver: zodResolver(workerVerificationSchema),
    defaultValues: {
      terms_agreed: workerData.terms_agreed || false,
    },
    mode: 'onChange',
  });

  const termsAgreed = watch('terms_agreed');

  const validateAndSetFile = (
    file: File,
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    fieldName: keyof WorkerVerificationForm
  ) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setState(prev => ({ ...prev, error: 'Only JPEG, PNG, and PDF files are allowed' }));
      return;
    }

    if (file.size > maxSize) {
      setState(prev => ({ ...prev, error: 'File size must be less than 5MB' }));
      return;
    }

    setState(prev => ({ ...prev, file, error: null }));
    setValue(fieldName, file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({ ...prev, preview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setState(prev => ({ ...prev, preview: null }));
    }
  };

  const handleIdDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file, setIdDocumentState, 'id_document');
    }
  };

  const handleClearanceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file, setClearanceState, 'clearance_certificate');
    }
  };

  const onSubmit = async (data: WorkerVerificationForm) => {
    try {
      // Update store with form data
      updateWorkerData({
        id_document: data.id_document,
        clearance_certificate: data.clearance_certificate,
        terms_agreed: data.terms_agreed,
      });

      // Move to next step
      nextStep();
      router.push('/auth/register/worker/earnings');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const FileUploadCard = ({
    title,
    description,
    state,
    onUpload,
    accept = "image/*,.pdf",
    required = true
  }: {
    title: string;
    description: string;
    state: FileUploadState;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    required?: boolean;
  }) => (
    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 hover:border-neutral-400 transition-colors">
      <div className="text-center">
        {state.file ? (
          <div className="space-y-4">
            {state.preview ? (
              <img
                src={state.preview}
                alt="Document preview"
                className="mx-auto max-h-32 rounded border"
              />
            ) : (
              <FileText className="mx-auto h-12 w-12 text-emerald-600" />
            )}
            <div>
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">File uploaded</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">{state.file.name}</p>
              <p className="text-xs text-neutral-500">
                {(state.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="font-medium text-neutral-900 mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 mb-4">{description}</p>
          </>
        )}

        <div className="space-y-2">
          <label className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            {state.file ? 'Replace File' : 'Choose File'}
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={onUpload}
            />
          </label>

          {state.error && (
            <div className="flex items-center gap-2 text-error-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {state.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <OnboardingLayout
      title="Document Verification"
      subtitle="Step 3 of 5: Verify your identity and background"
    >
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* ID Document Upload */}
          <div>
            <Label required>National ID or Passport</Label>
            <p className="text-sm text-neutral-600 mb-4">
              Upload a clear photo or scan of your National ID card or Passport.
              Make sure all text is readable and the document is valid.
            </p>
            <FileUploadCard
              title="Upload ID Document"
              description="Clear photo or scan of your National ID or Passport"
              state={idDocumentState}
              onUpload={handleIdDocumentUpload}
            />
            {errors.id_document && (
              <p className="text-sm text-error-600 mt-2">{String(errors.id_document.message)}</p>
            )}
          </div>

          {/* Police Clearance Certificate */}
          <div>
            <Label required>Police Clearance Certificate</Label>
            <p className="text-sm text-neutral-600 mb-4">
              Upload your Police Clearance Certificate or Criminal Background Check.
              This document should be recent (within the last 6 months).
            </p>
            <FileUploadCard
              title="Upload Clearance Certificate"
              description="Police clearance certificate or criminal background check"
              state={clearanceState}
              onUpload={handleClearanceUpload}
            />
            {errors.clearance_certificate && (
              <p className="text-sm text-error-600 mt-2">{String(errors.clearance_certificate.message)}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <input
                {...register('terms_agreed')}
                type="checkbox"
                className="w-5 h-5 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm text-neutral-900">
                  I agree to the{' '}
                  <a
                    href="/terms/worker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Worker Terms & Conditions
                  </a>
                  {' '}and{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Privacy Policy
                  </a>
                </p>
                <p className="text-xs text-neutral-600 mt-2">
                  By checking this box, you acknowledge that you have read and agree to our worker terms,
                  including background verification requirements and service standards.
                </p>
              </div>
            </div>
            {errors.terms_agreed && (
              <p className="text-sm text-error-600 mt-2">{errors.terms_agreed.message}</p>
            )}
          </div>

          {/* Information Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-emerald-800">
                  Verification Process
                </h3>
                <div className="mt-1 text-sm text-emerald-700 space-y-2">
                  <p>Your documents will be reviewed within 2-3 business days. We'll notify you via email and SMS once the verification is complete.</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Documents are securely stored and encrypted</li>
                    <li>Only authorized personnel can access your information</li>
                    <li>Verification helps build trust with customers</li>
                    <li>You can track verification status in your dashboard</li>
                  </ul>
                </div>
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
              {isSubmitting ? 'Submitting Documents...' : 'Continue to Earnings Setup'}
            </button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}