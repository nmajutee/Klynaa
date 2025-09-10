import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores';
import { LoginCredentials, ApiError } from '../../types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import WorkerReviewCarousel from '../../components/auth/WorkerReviewCarousel';

const Login: React.FC = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const { setUser } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>();

    const onSubmit = async (data: LoginCredentials) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.login(data);
            setUser(response.user);

            // Redirect based on user role
            switch (response.user.role) {
                case 'admin':
                    router.push('/dashboard');
                    break;
                case 'worker':
                    router.push('/dashboard');
                    break;
                case 'customer':
                    router.push('/dashboard');
                    break;
                default:
                    router.push('/dashboard');
            }
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.detail || apiError.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Social login handlers (placeholder - to be implemented with actual OAuth)
    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth
        console.log('Google login clicked');
    };

    const handleGitHubLogin = () => {
        // TODO: Implement GitHub OAuth
        console.log('GitHub login clicked');
    };

    const handleFacebookLogin = () => {
        // TODO: Implement Facebook OAuth
        console.log('Facebook login clicked');
    };

    return (
        <>
            <Head>
                <title>Sign In - Klynaa</title>
                <meta name="description" content="Sign in to your Klynaa account to access your waste management dashboard." />
            </Head>

            <div className="min-h-screen flex">
                {/* Left Panel - Login Form */}
                <div className="flex-1 flex items-center justify-center px-8 lg:px-12 bg-white">
                    <div className="max-w-md w-full space-y-8">
                        {/* Header */}
                        <div className="text-left">
                            <div className="flex items-center space-x-2 mb-8">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">K</span>
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Klynaa
                                </h1>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Log in to your Account
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Welcome back! Select method to log in:
                            </p>
                        </div>

                        {/* Login Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                {error && (
                                    <div className="rounded-lg p-4 bg-red-50 border border-red-200">
                                        <div className="text-red-800 text-sm">{error}</div>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="form-label text-gray-700 font-medium">
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
                                            className="form-input focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && (
                                            <p className="form-error">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="form-label text-gray-700 font-medium">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                {...register('password', {
                                                    required: 'Password is required',
                                                    minLength: {
                                                        value: 6,
                                                        message: 'Password must be at least 6 characters',
                                                    },
                                                })}
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                className="form-input pr-12 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Enter your password"
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
                                        {errors.password && (
                                            <p className="form-error">{errors.password.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Remember me and Forgot password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>

                                    <div>
                                        <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-500 font-medium">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {/* Sign in button */}
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
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign in'
                                        )}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                {/* Social Login Buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleGitHubLogin}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFacebookLogin}
                                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    </button>
                                </div>
                            </form>

                            {/* Create account link */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-500">
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Worker Reviews Carousel */}
                <div className="hidden md:block lg:w-1/2 xl:w-2/5 w-1/2">
                    <WorkerReviewCarousel />
                </div>
            </div>
        </>
    );
};

export default Login;