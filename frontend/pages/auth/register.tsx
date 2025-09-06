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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-background-hover)' }}>
            <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
                <div>
                    <div className="mx-auto h-12 w-auto flex items-center justify-center">
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h2)', fontWeight: 700, color: 'var(--color-black)' }}>
                            Klynaa
                        </h1>
                    </div>
                    <h2 className="mt-6 text-center" style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h3)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Create your account
                    </h2>
                    <p className="mt-2 text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-medium hover:underline" style={{ color: 'var(--color-black)' }}>
                            Sign in here
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-md p-4" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: '#DC2626' }}>{error}</div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="form-label">
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
                                    className="form-input"
                                    placeholder="John"
                                />
                                {errors.first_name && (
                                    <p className="form-error">{errors.first_name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="last_name" className="form-label">
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
                                    className="form-input"
                                    placeholder="Doe"
                                />
                                {errors.last_name && (
                                    <p className="form-error">{errors.last_name.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label">
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
                                className="form-input"
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <p className="form-error">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="form-label">
                                Phone Number (Optional)
                            </label>
                            <input
                                {...register('phone_number')}
                                type="tel"
                                className="form-input"
                                placeholder="+237 6XX XXX XXX"
                            />
                            {errors.phone_number && (
                                <p className="form-error">{errors.phone_number.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="role" className="form-label">
                                Account Type
                            </label>
                            <select
                                {...register('role', { required: 'Please select an account type' })}
                                className="form-input form-select"
                            >
                                <option value="">Select account type</option>
                                <option value="customer">Customer - Request waste pickup services</option>
                                <option value="worker">Worker - Provide waste pickup services</option>
                            </select>
                            {errors.role && (
                                <p className="form-error">{errors.role.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="location" className="form-label">
                                Location (Optional)
                            </label>
                            <input
                                {...register('location')}
                                type="text"
                                className="form-input"
                                placeholder="Douala, Cameroon"
                            />
                            {errors.location && (
                                <p className="form-error">{errors.location.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">
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
                                    className="form-input pr-12"
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
                                <p className="form-error">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password_confirm" className="form-label">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password_confirm', {
                                        required: 'Please confirm your password',
                                        validate: (value) => value === password || 'Passwords do not match',
                                    })}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="form-input pr-12"
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
                                <p className="form-error">{errors.password_confirm.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="agree-terms"
                            name="agree-terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            style={{ accentColor: '#16a34a' }}
                        />
                        <label htmlFor="agree-terms" className="ml-2 block form-label mb-0">
                            I agree to the{' '}
                            <a href="#" className="underline hover:no-underline" style={{ color: 'var(--color-black)' }}>
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="underline hover:no-underline" style={{ color: 'var(--color-black)' }}>
                                Privacy Policy
                            </a>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex justify-center items-center"
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'var(--text-body)',
                                fontWeight: 600,
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
