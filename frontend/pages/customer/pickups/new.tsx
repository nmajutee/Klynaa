/**
 * New Pickup Request - Form for scheduling waste pickups
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { customerDashboardApi, Bin, CreatePickupRequest } from '../../../services/customerDashboardApi';
import { useAuthStore } from '../../../stores';

interface FormErrors {
  bin_id?: string;
  waste_type?: string;
  estimated_weight_kg?: string;
  preferred_pickup_time?: string;
  payment_method?: string;
  notes?: string;
  general?: string;
}

const NewPickupRequest: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<CreatePickupRequest>({
    bin_id: 0,
    waste_type: 'general',
    estimated_weight_kg: 5,
    preferred_pickup_time: '',
    notes: '',
    payment_method: 'mobile_money'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'customer') {
      router.push('/dashboard');
      return;
    }

    loadBins();
  }, [isAuthenticated, user, router]);

  const loadBins = async () => {
    try {
      setLoading(true);
      const response = await customerDashboardApi.getBins({ status: 'active' });
      setBins(response.results);

      // Auto-select first bin if available
      if (response.results.length > 0) {
        setFormData(prev => ({ ...prev, bin_id: response.results[0].id }));
      }
    } catch (err) {
      console.error('Failed to load bins:', err);
      setErrors({ general: 'Failed to load your bins. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.bin_id || formData.bin_id === 0) {
      newErrors.bin_id = 'Please select a bin';
    }

    if (!formData.waste_type) {
      newErrors.waste_type = 'Please select a waste type';
    }

    if (!formData.estimated_weight_kg || formData.estimated_weight_kg <= 0) {
      newErrors.estimated_weight_kg = 'Weight must be greater than 0';
    } else if (formData.estimated_weight_kg > 100) {
      newErrors.estimated_weight_kg = 'Weight cannot exceed 100kg per pickup';
    }

    if (formData.preferred_pickup_time) {
      const pickupDate = new Date(formData.preferred_pickup_time);
      const now = new Date();

      if (pickupDate <= now) {
        newErrors.preferred_pickup_time = 'Pickup time must be in the future';
      }

      // Check if pickup time is within reasonable limits (not more than 30 days)
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      if (pickupDate > maxDate) {
        newErrors.preferred_pickup_time = 'Pickup cannot be scheduled more than 30 days ahead';
      }
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setErrors({});

      const pickup = await customerDashboardApi.createPickup(formData);

      // Redirect to pickup details or pickups list
      router.push(`/customer/pickups?created=${pickup.id}`);
    } catch (err: any) {
      console.error('Failed to create pickup:', err);

      // Handle validation errors from backend
      if (err.response?.data) {
        const backendErrors: FormErrors = {};
        Object.keys(err.response.data).forEach(key => {
          backendErrors[key as keyof FormErrors] = Array.isArray(err.response.data[key])
            ? err.response.data[key][0]
            : err.response.data[key];
        });
        setErrors(backendErrors);
      } else {
        setErrors({ general: 'Failed to create pickup request. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreatePickupRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getSelectedBin = (): Bin | null => {
    return bins.find(bin => bin.id === formData.bin_id) || null;
  };

  const getEstimatedFee = (): number => {
    const baseRate = 20; // Base rate per kg
    const weight = formData.estimated_weight_kg || 0;

    const wasteMultipliers = {
      'organic': 1.0,
      'plastic': 1.2,
      'metal': 1.5,
      'electronic': 2.0,
      'general': 1.0
    };

    const multiplier = wasteMultipliers[formData.waste_type as keyof typeof wasteMultipliers] || 1.0;
    return weight * baseRate * multiplier;
  };

  // Get tomorrow's date as minimum for date picker
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM
    return tomorrow.toISOString().slice(0, 16); // Format for datetime-local input
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bins...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (bins.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🗑️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bins Found</h2>
              <p className="text-gray-600 mb-6">
                You need to add bins before you can request pickups.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/customer/bins')}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Add Your First Bin
                </button>
                <button
                  onClick={() => router.push('/customer/dashboard')}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Request Pickup</h1>
                <p className="text-gray-600 mt-1">
                  Schedule a waste collection for one of your bins
                </p>
              </div>
              <button
                onClick={() => router.push('/customer/pickups')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back to Pickups
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bin Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Bin</h3>

                  <div className="space-y-3">
                    {bins.map(bin => (
                      <label key={bin.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-green-500">
                        <input
                          type="radio"
                          name="bin_id"
                          value={bin.id}
                          checked={formData.bin_id === bin.id}
                          onChange={(e) => handleInputChange('bin_id', parseInt(e.target.value))}
                          className="mr-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{bin.label}</h4>
                              <p className="text-sm text-gray-600">{bin.address}</p>
                              <p className="text-xs text-gray-500">
                                Fill Level: {bin.fill_level}% • Capacity: {bin.capacity_liters}L
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${customerDashboardApi.getStatusColor(bin.status)}`}>
                                {bin.status}
                              </span>
                              <div className="mt-1">
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                  <div
                                    className={`h-full rounded-full ${customerDashboardApi.getFillLevelBgColor(bin.fill_level)}`}
                                    style={{ width: `${bin.fill_level}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {errors.bin_id && (
                    <p className="mt-2 text-sm text-red-600">{errors.bin_id}</p>
                  )}
                </div>

                {/* Pickup Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Waste Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waste Type *
                      </label>
                      <select
                        value={formData.waste_type}
                        onChange={(e) => handleInputChange('waste_type', e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 ${errors.waste_type ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="general">General Waste</option>
                        <option value="organic">Organic Waste</option>
                        <option value="plastic">Plastic & Recyclables</option>
                        <option value="metal">Metal & Scrap</option>
                        <option value="electronic">Electronic Waste</option>
                      </select>
                      {errors.waste_type && (
                        <p className="mt-1 text-sm text-red-600">{errors.waste_type}</p>
                      )}
                    </div>

                    {/* Estimated Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Weight (kg) *
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={formData.estimated_weight_kg}
                        onChange={(e) => handleInputChange('estimated_weight_kg', parseFloat(e.target.value))}
                        className={`w-full border rounded-lg px-3 py-2 ${errors.estimated_weight_kg ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g., 5.5"
                      />
                      {errors.estimated_weight_kg && (
                        <p className="mt-1 text-sm text-red-600">{errors.estimated_weight_kg}</p>
                      )}
                    </div>

                    {/* Preferred Pickup Time */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Pickup Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        min={getTomorrowDate()}
                        value={formData.preferred_pickup_time}
                        onChange={(e) => handleInputChange('preferred_pickup_time', e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 ${errors.preferred_pickup_time ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        If not specified, we'll schedule for the next available time slot
                      </p>
                      {errors.preferred_pickup_time && (
                        <p className="mt-1 text-sm text-red-600">{errors.preferred_pickup_time}</p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { value: 'mobile_money', label: 'Mobile Money', icon: '📱', desc: 'Pay via MTN/Airtel' },
                          { value: 'cash', label: 'Cash on Delivery', icon: '💰', desc: 'Pay when collected' },
                          { value: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Pay by card' }
                        ].map(method => (
                          <label key={method.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-green-500">
                            <input
                              type="radio"
                              name="payment_method"
                              value={method.value}
                              checked={formData.payment_method === method.value}
                              onChange={(e) => handleInputChange('payment_method', e.target.value)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span>{method.icon}</span>
                                <span className="font-medium">{method.label}</span>
                              </div>
                              <p className="text-xs text-gray-500">{method.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.payment_method && (
                        <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                        placeholder="Any special instructions for the worker..."
                        maxLength={500}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.notes?.length || 0}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Summary */}
              <div className="space-y-6">
                {/* Selected Bin Summary */}
                {getSelectedBin() && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Bin</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{getSelectedBin()!.label}</h4>
                        <p className="text-sm text-gray-600">{getSelectedBin()!.address}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Fill Level:</span>
                        <span className={`font-medium ${customerDashboardApi.getFillLevelColor(getSelectedBin()!.fill_level)}`}>
                          {getSelectedBin()!.fill_level}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Capacity:</span>
                        <span>{getSelectedBin()!.capacity_liters}L</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Weight:</span>
                      <span>{formData.estimated_weight_kg || 0} kg</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Waste Type:</span>
                      <span className="capitalize">{formData.waste_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Base Rate:</span>
                      <span>UGX 20/kg</span>
                    </div>
                    <hr />
                    <div className="flex items-center justify-between font-medium">
                      <span>Estimated Total:</span>
                      <span className="text-lg">
                        {customerDashboardApi.formatCurrency(getEstimatedFee())}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      * Final price may vary based on actual weight
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || bins.length === 0}
                  className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Request...
                    </div>
                  ) : (
                    'Request Pickup'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NewPickupRequest;
