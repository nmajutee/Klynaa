import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import PrivateRoute from '../components/PrivateRoute';
import { useBinsStore, useAuthStore } from '../stores';
import { binsApi } from '../services/api';
import { Bin, BinCreateData } from '../types';
import {
    TrashIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon as DeleteIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

interface BinFormData {
    bin_id: string;
    label: string;
    address: string;
    capacity_liters: number;
    latitude: number;
    longitude: number;
}

const BinsPage: React.FC = () => {
    const { user } = useAuthStore();
    const { bins, setBins, addBin, setLoading, setError } = useBinsStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BinFormData>();

    const loadBins = useCallback(async () => {
        try {
            setLoading(true);
            const response = await binsApi.getBins();
            setBins(response.results);
        } catch (error) {
            console.error('Failed to load bins:', error);
            setError('Failed to load bins');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // setState functions are stable and don't need to be in dependencies

    useEffect(() => {
        loadBins();
    }, [loadBins]);

    const onSubmit = async (data: BinFormData) => {
        setIsSubmitting(true);
        try {
            const newBin = await binsApi.createBin(data);
            addBin(newBin);
            setShowCreateForm(false);
            reset();
        } catch (error) {
            console.error('Failed to create bin:', error);
            setError('Failed to create bin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFillLevelColor = (level: number) => {
        if (level < 50) return 'text-green-500';
        if (level < 80) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getFillLevelBg = (level: number) => {
        if (level < 50) return 'bg-green-100';
        if (level < 80) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'maintenance':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const BinCard: React.FC<{ bin: Bin }> = ({ bin }) => (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${getFillLevelBg(bin.fill_level)}`}>
                        <TrashIcon className={`h-6 w-6 ${getFillLevelColor(bin.fill_level)}`} />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{bin.label}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {bin.address}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <DeleteIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fill Level</span>
                    <span className={`text-sm font-semibold ${getFillLevelColor(bin.fill_level)}`}>
                        {bin.fill_level}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${bin.fill_level < 50 ? 'bg-green-500' :
                            bin.fill_level < 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${bin.fill_level}%` }}
                    />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(bin.status)}`}>
                        {bin.status}
                    </span>
                </div>
                <div className="text-sm text-gray-500">
                    Capacity: {bin.capacity_liters}L
                </div>
            </div>

            {bin.fill_level > 80 && (
                <div className="mt-4">
                    <button className="w-full btn-primary text-sm">
                        Request Pickup
                    </button>
                </div>
            )}
        </div>
    );

    const CreateBinForm = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Bin</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="form-label">Bin Name</label>
                            <input
                                {...register('label', { required: 'Bin name is required' })}
                                type="text"
                                className="form-input"
                                placeholder="e.g., Kitchen Bin"
                            />
                            {errors.label && (
                                <p className="form-error">{errors.label.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="form-label">Location</label>
                            <input
                                {...register('address', { required: 'Address is required' })}
                                type="text"
                                className="form-input"
                                placeholder="e.g., Kitchen, Garden"
                            />
                            {errors.address && (
                                <p className="form-error">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Latitude</label>
                                <input
                                    {...register('latitude', {
                                        required: 'Latitude is required',
                                        valueAsNumber: true
                                    })}
                                    type="number"
                                    step="any"
                                    className="form-input"
                                    placeholder="4.0511"
                                />
                                {errors.latitude && (
                                    <p className="form-error">{errors.latitude.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="form-label">Longitude</label>
                                <input
                                    {...register('longitude', {
                                        required: 'Longitude is required',
                                        valueAsNumber: true
                                    })}
                                    type="number"
                                    step="any"
                                    className="form-input"
                                    placeholder="9.7679"
                                />
                                {errors.longitude && (
                                    <p className="form-error">{errors.longitude.message}</p>
                                )}
                            </div>
                        </div>



                        <div>
                            <label className="form-label">Capacity (Liters)</label>
                            <input
                                {...register('capacity_liters', {
                                    required: 'Capacity is required',
                                    valueAsNumber: true,
                                    min: { value: 1, message: 'Capacity must be at least 1 liter' }
                                })}
                                type="number"
                                className="form-input"
                                placeholder="50"
                            />
                            {errors.capacity_liters && (
                                <p className="form-error">{errors.capacity_liters.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Bin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <PrivateRoute>
            <Layout>
                <div className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {user?.role === 'admin' ? 'All Bins' : 'My Bins'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {user?.role === 'admin'
                                        ? 'Manage all bins in the system'
                                        : 'Monitor and manage your waste bins'
                                    }
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="btn-primary flex items-center"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Bin
                            </button>
                        </div>

                        {bins.length === 0 ? (
                            <div className="text-center py-12">
                                <TrashIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No bins</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by adding your first waste bin.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="btn-primary"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Add your first bin
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {bins.map((bin) => (
                                    <BinCard key={bin.id} bin={bin} />
                                ))}
                            </div>
                        )}

                        {showCreateForm && <CreateBinForm />}
                    </div>
                </div>
            </Layout>
        </PrivateRoute>
    );
};

export default BinsPage;
