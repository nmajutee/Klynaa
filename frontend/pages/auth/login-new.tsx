import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores';
import { LoginCredentials, ApiError } from '../../types';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

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

    const handleFacebookLogin = () => {
        // TODO: Implement Facebook OAuth
        console.log('Facebook login clicked');
    };

    return (
        <>
            <Head>
                <title>Log in to your Account - Klynaa</title>
                <meta name="description" content="Sign in to your Klynaa account to access your dashboard." />
            </Head>

            {/* Page Background */}
            <div className="min-h-screen w-full bg-[#E5E7EB] flex items-center justify-center px-4 py-8">
                {/* Centered Card Container */}
                <div className="w-full max-w-[960px] bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
                    <div className="grid grid-cols-2 min-h-[600px]">
                        {/* Left: Form */}
                        <div className="p-12 flex flex-col justify-center">
                            <div className="max-w-[320px] w-full">
                                {/* Branding */}
                                <div className="flex items-center space-x-2 mb-10">
                                    <div className="w-6 h-6 bg-[#1E40AF] rounded flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">dotwork</span>
                                </div>

                                {/* Heading */}
                                <h2 className="text-[28px] leading-tight font-semibold text-gray-900 mb-2">Log in to your Account</h2>
                                <p className="text-[15px] text-gray-600 mb-8">Welcome back! Select method to log in:</p>

                                {/* Social Buttons */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="flex items-center justify-center h-11 rounded-[8px] bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                    >
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        Google
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFacebookLogin}
                                        className="flex items-center justify-center h-11 rounded-[8px] bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        Facebook
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-3 bg-white text-xs text-gray-500">or continue with email</span>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-describedby={error ? 'login-error' : undefined}>
                                    {error && (
                                        <div id="login-error" role="alert" className="rounded-lg p-3 bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>
                                    )}

                                    {/* Email */}
                                    <div>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                            </span>
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
                                                placeholder="Email"
                                                className="block w-full h-11 pl-9 pr-3 rounded-[8px] border border-gray-200 bg-white placeholder-gray-400 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                aria-invalid={errors.email ? 'true' : 'false'}
                                                aria-describedby={errors.email ? 'email-error' : undefined}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                <LockClosedIcon className="h-4 w-4 text-gray-400" />
                                            </span>
                                            <input
                                                {...register('password', {
                                                  required: 'Password is required',
                                                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                                })}
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                                className="block w-full h-11 pl-9 pr-10 rounded-[8px] border border-gray-200 bg-white placeholder-gray-400 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                aria-invalid={errors.password ? 'true' : 'false'}
                                                aria-describedby={errors.password ? 'password-error' : undefined}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center">
                                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                                        </div>
                                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">Forgot Password?</Link>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 mt-6 flex justify-center items-center rounded-[8px] bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </>
                                        ) : (
                                            'Log In'
                                        )}
                                    </button>
                                </form>

                                {/* Bottom Link */}
                                <p className="mt-6 text-center text-sm text-gray-600">
                                    Don't have an account?
                                    {' '}
                                    <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">Create an account</Link>
                                </p>
                            </div>
                        </div>

                        {/* Right: Visual Panel */}
                        <div className="relative bg-[#4F46E5] flex items-center justify-center overflow-hidden">
                            {/* Background decorative elements */}
                            <div className="absolute inset-0">
                                {/* Large background circle */}
                                <div className="absolute top-8 right-8 w-80 h-80 rounded-full border border-white/10"></div>
                                <div className="absolute top-16 right-16 w-64 h-64 rounded-full border border-white/5"></div>

                                {/* Floating app icons */}
                                <div className="absolute top-20 right-32">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-36 right-20">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">f</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-52 right-36">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">G</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main content */}
                            <div className="relative z-10 text-center text-white px-8">
                                {/* Dashboard preview card */}
                                <div className="bg-white rounded-lg shadow-lg p-4 mb-8 max-w-xs mx-auto">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="text-left space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100"></div>
                                            <div className="h-2 bg-gray-200 rounded flex-1"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100"></div>
                                            <div className="h-2 bg-gray-200 rounded flex-1"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-green-100"></div>
                                            <div className="h-2 bg-gray-200 rounded flex-1"></div>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-semibold mb-2">Connect with every application.</h3>
                                <p className="text-white/80 text-base mb-8">Everything you need in an easily customizable dashboard.</p>

                                {/* Pagination dots */}
                                <div className="flex justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                    <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
