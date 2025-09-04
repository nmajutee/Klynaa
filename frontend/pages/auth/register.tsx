import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores';
import { RegisterData, ApiError } from '../../types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register: React.FC = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const { setUser } = useAuthStore();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterData>();

    const password = watch('password');

    const onSubmit = async (data: RegisterData) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.register(data);
            setUser(response.user);

            // Redirect to dashboard after successful registration
            router.push('/dashboard');
        } catch (err) {
            const apiError = err as ApiError;
            if (apiError.errors) {
                // Handle field-specific errors
                const errorMessages = Object.values(apiError.errors).flat();
                setError(errorMessages.join(', '));
            } else {
                setError(apiError.detail || apiError.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-auto flex items-center justify-center">
                        <h1 className="text-3xl font-bold text-primary-600">Klynaa</h1>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in here
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="label">
                                    First Name
                                </label>
                                <input
                                    {...register('first_name', {
                                        required: 'First name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'First name must be at least 2 characters',
                                        },
                                    })}
                                    type="text"
                                    className="input-field"
                                    placeholder="John"
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="last_name" className="label">
                                    Last Name
                                </label>
                                <input
                                    {...register('last_name', {
                                        required: 'Last name is required',
                                        minLength: {
                                            value: 2,
                                            message: 'Last name must be at least 2 characters',
                                        },
                                    })}
                                    type="text"
                                    className="input-field"
                                    placeholder="Doe"
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="label">
                                Email address
                            </label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                type="email"
                                autoComplete="email"
                                className="input-field"
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="label">
                                Phone Number (Optional)
                            </label>
                            <input
                                {...register('phone_number')}
                                type="tel"
                                className="input-field"
                                placeholder="+237 6XX XXX XXX"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="label">
                                Account Type
                            </label>
                            <select
                                {...register('role', { required: 'Please select an account type' })}
                                className="input-field"
                            >
                                <option value="">Select account type</option>
                                <option value="customer">Customer - Request waste pickup services</option>
                                <option value="worker">Worker - Provide waste pickup services</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="location" className="label">
                                Location (Optional)
                            </label>
                            <input
                                {...register('location')}
                                type="text"
                                className="input-field"
                                placeholder="Douala, Cameroon"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                                        },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-10"
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password_confirm" className="label">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password_confirm', {
                                        required: 'Please confirm your password',
                                        validate: (value) => value === password || 'Passwords do not match',
                                    })}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="input-field pr-10"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirm && (
                                <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="agree-terms"
                            name="agree-terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                            I agree to the{' '}
                            <a href="#" className="text-primary-600 hover:text-primary-500">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-primary-600 hover:text-primary-500">
                                Privacy Policy
                            </a>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="spinner mr-2" />
                            ) : null}
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
