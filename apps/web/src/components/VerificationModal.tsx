import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '../../components/ui/Icons';
import { Input, Field, Label } from '../design-system/components/Form';
import { FORM_UI_SETTINGS } from '../config/formSettings';

// Validation schema for verification documents
const verificationSchema = z.object({
  id_type: z.enum(['passport', 'national_id', 'drivers_license']),
  id_document_front: z.any().refine((file) => file instanceof File, 'ID document is required'),
  id_document_back: z.any().optional(),
  address_verification: z.any().refine((file) => file instanceof File, 'Address verification document is required'),
  taxpayer_card: z.any().optional(),
});

type VerificationForm = z.infer<typeof verificationSchema>;

interface FileUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'worker' | 'bin_owner';
  onSubmit: (data: VerificationForm) => Promise<void>;
}

export default function VerificationModal({ isOpen, onClose, userType, onSubmit }: VerificationModalProps) {
  const [idDocumentFront, setIdDocumentFront] = useState<FileUploadState>({ file: null, preview: null, error: null });
  const [idDocumentBack, setIdDocumentBack] = useState<FileUploadState>({ file: null, preview: null, error: null });
  const [addressVerification, setAddressVerification] = useState<FileUploadState>({ file: null, preview: null, error: null });
  const [taxpayerCard, setTaxpayerCard] = useState<FileUploadState>({ file: null, preview: null, error: null });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    mode: 'onChange'
  });

  const selectedIdType = watch('id_type');

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    fieldName: keyof VerificationForm
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setState(prev => ({ ...prev, error: 'Please upload a JPEG, PNG, or PDF file' }));
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setState(prev => ({ ...prev, error: 'File size must be less than 5MB' }));
      return;
    }

    setValue(fieldName, file);
    setState(prev => ({ ...prev, error: null }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          file,
          preview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setState(prev => ({ ...prev, file, preview: null }));
    }
  };

  const removeFile = (
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    fieldName: keyof VerificationForm
  ) => {
    setState({ file: null, preview: null, error: null });
    setValue(fieldName, undefined);
  };

  const handleFormSubmit = async (data: VerificationForm) => {
    try {
      await onSubmit(data);
      reset();
      setIdDocumentFront({ file: null, preview: null, error: null });
      setIdDocumentBack({ file: null, preview: null, error: null });
      setAddressVerification({ file: null, preview: null, error: null });
      setTaxpayerCard({ file: null, preview: null, error: null });
      onClose();
    } catch (error) {
      console.error('Verification submission error:', error);
    }
  };

  const getIdTypeLabel = (type: string) => {
    switch (type) {
      case 'passport': return 'Passport';
      case 'national_id': return 'National ID';
      case 'drivers_license': return 'Driver\'s License';
      default: return '';
    }
  };

  const needsBackSide = selectedIdType === 'national_id' || selectedIdType === 'drivers_license';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Complete Verification
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Upload your documents to verify your {userType === 'worker' ? 'worker' : 'bin owner'} account
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"
          >
            <Icon name="X" size={20 as any} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* ID Type Selection */}
          <Field label="ID Type" error={errors.id_type?.message ? String(errors.id_type.message) : undefined}>
            <select
              {...register('id_type')}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select ID type...</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </Field>

          {/* ID Document Upload */}
          {selectedIdType && (
            <div className="space-y-4">
              <Label>
                {getIdTypeLabel(selectedIdType)} {selectedIdType === 'passport' ? '' : '(Front)'}
              </Label>

              {/* Front/Main Document */}
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4">
                {idDocumentFront.preview ? (
                  <div className="relative">
                    <img
                      src={idDocumentFront.preview}
                      alt="ID Document"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(setIdDocumentFront, 'id_document_front')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Icon name="X" size={16 as any} />
                    </button>
                  </div>
                ) : idDocumentFront.file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="FileText" className="text-neutral-500" size={20 as any} />
                      <span className="text-sm text-neutral-700">{idDocumentFront.file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(setIdDocumentFront, 'id_document_front')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Icon name="X" size={16 as any} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                    <Icon name="Upload" className="text-neutral-400 mb-2" size={24 as any} />
                    <span className="text-sm text-neutral-600">
                      Click to upload {getIdTypeLabel(selectedIdType)} {selectedIdType === 'passport' ? '(first page)' : '(front)'}
                    </span>
                    <span className="text-xs text-neutral-500 mt-1">
                      JPEG, PNG, or PDF (max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={(e) => handleFileUpload(e, setIdDocumentFront, 'id_document_front')}
                      className="hidden"
                    />
                  </label>
                )}
                {idDocumentFront.error && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <Icon name="AlertCircle" size={16 as any} />
                    {idDocumentFront.error}
                  </p>
                )}
                {errors.id_document_front && (
                  <p className="text-red-600 text-sm mt-2">{String(errors.id_document_front.message)}</p>
                )}
              </div>

              {/* Back Side for National ID and Driver's License */}
              {needsBackSide && (
                <div>
                  <Label>{getIdTypeLabel(selectedIdType)} (Back)</Label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 mt-2">
                    {idDocumentBack.preview ? (
                      <div className="relative">
                        <img
                          src={idDocumentBack.preview}
                          alt="ID Document Back"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(setIdDocumentBack, 'id_document_back')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Icon name="X" size={16 as any} />
                        </button>
                      </div>
                    ) : idDocumentBack.file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name="FileText" className="text-neutral-500" size={20 as any} />
                          <span className="text-sm text-neutral-700">{idDocumentBack.file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(setIdDocumentBack, 'id_document_back')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Icon name="X" size={16 as any} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                        <Icon name="Upload" className="text-neutral-400 mb-2" size={24 as any} />
                        <span className="text-sm text-neutral-600">
                          Click to upload {getIdTypeLabel(selectedIdType)} (back)
                        </span>
                        <span className="text-xs text-neutral-500 mt-1">
                          JPEG, PNG, or PDF (max 5MB)
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,application/pdf"
                          onChange={(e) => handleFileUpload(e, setIdDocumentBack, 'id_document_back')}
                          className="hidden"
                        />
                      </label>
                    )}
                    {idDocumentBack.error && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <Icon name="AlertCircle" size={16 as any} />
                        {idDocumentBack.error}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address Verification */}
          <div>
            <Label>Address Verification</Label>
            <p className="text-xs text-neutral-500 mb-2">
              Bank statement or utility bill (not older than 3 months)
            </p>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4">
              {addressVerification.preview ? (
                <div className="relative">
                  <img
                    src={addressVerification.preview}
                    alt="Address Verification"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(setAddressVerification, 'address_verification')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Icon name="X" size={16 as any} />
                  </button>
                </div>
              ) : addressVerification.file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" className="text-neutral-500" size={20 as any} />
                    <span className="text-sm text-neutral-700">{addressVerification.file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(setAddressVerification, 'address_verification')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="X" size={16 as any} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                  <Icon name="Upload" className="text-neutral-400 mb-2" size={24 as any} />
                  <span className="text-sm text-neutral-600">
                    Click to upload address verification
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">
                    Bank statement, utility bill - JPEG, PNG, or PDF (max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => handleFileUpload(e, setAddressVerification, 'address_verification')}
                    className="hidden"
                  />
                </label>
              )}
              {addressVerification.error && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <Icon name="AlertCircle" size={16 as any} />
                  {addressVerification.error}
                </p>
              )}
              {errors.address_verification && (
                <p className="text-red-600 text-sm mt-2">{String(errors.address_verification.message)}</p>
              )}
            </div>
          </div>

          {/* Taxpayer Card (Optional) */}
          <div>
            <Label>Taxpayer Card (Optional)</Label>
            <p className="text-xs text-neutral-500 mb-2">
              Tax identification document if applicable
            </p>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4">
              {taxpayerCard.preview ? (
                <div className="relative">
                  <img
                    src={taxpayerCard.preview}
                    alt="Taxpayer Card"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(setTaxpayerCard, 'taxpayer_card')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Icon name="X" size={16 as any} />
                  </button>
                </div>
              ) : taxpayerCard.file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" className="text-neutral-500" size={20 as any} />
                    <span className="text-sm text-neutral-700">{taxpayerCard.file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(setTaxpayerCard, 'taxpayer_card')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="X" size={16 as any} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                  <Icon name="Upload" className="text-neutral-400 mb-2" size={24 as any} />
                  <span className="text-sm text-neutral-600">
                    Click to upload taxpayer card
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">
                    JPEG, PNG, or PDF (max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => handleFileUpload(e, setTaxpayerCard, 'taxpayer_card')}
                    className="hidden"
                  />
                </label>
              )}
              {taxpayerCard.error && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <Icon name="AlertCircle" size={16 as any} />
                  {taxpayerCard.error}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-neutral-600 hover:text-neutral-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={FORM_UI_SETTINGS.fieldClasses.button.primary}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Documents...
                </>
              ) : (
                'Submit for Verification'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}