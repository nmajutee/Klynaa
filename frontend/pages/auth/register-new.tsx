import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores';
import { RegisterData, ApiError } from '../../types';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import WorkerReviewCarousel from '../../components/auth/WorkerReviewCarousel';

interface FormData extends RegisterData {
    password_confirm: string;
}

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
    } = useForm<FormData>();

    const watchPassword = watch('password', '');

    // Password strength validation
    const getPasswordStrength = (password: string) => {
        const criteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const score = Object.values(criteria).filter(Boolean).length;
        return { criteria, score };
    };

    const passwordStrength = getPasswordStrength(watchPassword);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError('');

        try {
            const registerData: RegisterData = {
                email: data.email,
                password: data.password,
                password_confirm: data.password_confirm,
                first_name: data.first_name,
                last_name: data.last_name,
                phone_number: data.phone_number,
                role: data.role,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
            };

            const response = await authApi.register(registerData);
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
        <>
            <Head>
                <title>Create Account - Klynaa</title>
                <meta name="description" content="Join Klynaa's waste management network. Create your account to start managing waste sustainably." />
            </Head>

            <div className="min-h-screen flex">
                {/* Left Panel - Registration Form */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="max-w-md w-full space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <div className="mx-auto h-16 w-auto flex items-center justify-center mb-8">
                                <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">K</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Klynaa
                                    </h1>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Create your account
                            </h2>
                            <p className="text-gray-600">
                                Join our sustainable waste management network
                            </p>
                        </div>

                        {/* Registration Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                {error && (
                                    <div className="rounded-lg p-4 bg-red-50 border border-red-200">
                                        <div className="text-red-800 text-sm">{error}</div>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="first_name" className="form-label text-gray-700 font-medium">
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
                                                className="form-input focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="John"
                                            />
                                            {errors.first_name && (
                                                <p className="form-error">{errors.first_name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="last_name" className="form-label text-gray-700 font-medium">
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
                                                className="form-input focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Doe"
                                            />
                                            {errors.last_name && (
                                                <p className="form-error">{errors.last_name.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="form-label text-gray-700 font-medium">
                                            Email Address
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
                                            className="form-input focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && (
                                            <p className="form-error">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Phone Number Field */}
                                    <div>
                                        <label htmlFor="phone_number" className="form-label text-gray-700 font-medium">
                                            Phone Number <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            {...register('phone_number')}
                                            type="tel"
                                            className="form-input focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="+237 6XX XXX XXX"
                                        />
                                        {errors.phone_number && (
                                            <p className="form-error">{errors.phone_number.message}</p>
                                        )}
                                    </div>

                                    {/* Role Selection */}
                                    <div>
                                        <label htmlFor="role" className="form-label text-gray-700 font-medium">
                                            Account Type
                                        </label>
                                        <select
                                            {...register('role', { required: 'Please select an account type' })}
                                            className="form-input form-select focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Select account type</option>
                                            <option value="customer">Customer - Request waste pickup services</option>
                                            <option value="worker">Worker - Provide waste pickup services</option>
                                        </select>
                                        {errors.role && (
                                            <p className="form-error">{errors.role.message}</p>
                                        )}
                                    </div>

                                    {/* Location Field */}
                                    <div>
                                        <label htmlFor="location" className="form-label text-gray-700 font-medium">
                                            Location <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            {...register('location')}
                                            type="text"
                                            className="form-input focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Douala, Cameroon"
                                        />
                                        {errors.location && (
                                            <p className="form-error">{errors.location.message}</p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="form-label text-gray-700 font-medium">
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
                                                    validate: {
                                                        strength: (value) => {
                                                            const { score } = getPasswordStrength(value);
                                                            return score >= 3 || 'Password must contain at least uppercase, lowercase, and number';
                                                        },
                                                    },
                                                })}
                                                type={showPassword ? 'text' : 'password'}
                                                className="form-input pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Create a strong password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-green-600 transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Password Strength Indicator */}
                                        {watchPassword && (
                                            <div className="mt-3">
                                                <div className="flex space-x-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1 flex-1 rounded ${
                                                                level <= passwordStrength.score
                                                                    ? passwordStrength.score <= 2
                                                                        ? 'bg-red-500'
                                                                        : passwordStrength.score <= 3
                                                                        ? 'bg-yellow-500'
                                                                        : 'bg-green-500'
                                                                    : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-xs space-y-1">
                                                    {Object.entries({
                                                        'At least 8 characters': passwordStrength.criteria.length,
                                                        'One uppercase letter': passwordStrength.criteria.uppercase,
                                                        'One lowercase letter': passwordStrength.criteria.lowercase,
                                                        'One number': passwordStrength.criteria.number,
                                                    }).map(([requirement, met]) => (
                                                        <div key={requirement} className="flex items-center space-x-1">
                                                            {met ? (
                                                                <CheckIcon className="h-3 w-3 text-green-500" />
                                                            ) : (
                                                                <XMarkIcon className="h-3 w-3 text-gray-300" />
                                                            )}
                                                            <span className={met ? 'text-green-700' : 'text-gray-500'}>
                                                                {requirement}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {errors.password && (
                                            <p className="form-error">{errors.password.message}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <label htmlFor="password_confirm" className="form-label text-gray-700 font-medium">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                {...register('password_confirm', {
                                                    required: 'Please confirm your password',
                                                    validate: {
                                                        match: (value) =>
                                                            value === watchPassword || 'Passwords do not match',
                                                    },
                                                })}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="form-input pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Confirm your password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-green-600 transition-colors"
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

                                {/* Terms and Privacy */}
                                <div className="flex items-start">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        required
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                                    />
                                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-green-600 hover:text-green-500 font-medium">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="text-green-600 hover:text-green-500 font-medium">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>

                                {/* Create Account Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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

                            {/* Sign in link */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Worker Reviews Carousel */}
                <div className="hidden lg:block lg:w-1/2 xl:w-2/5">
                    <WorkerReviewCarousel />
                </div>
            </div>
        </>
    );
};

export default Register;
