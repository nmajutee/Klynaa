import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

const Login: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>();

    const onSubmit = async (data: LoginCredentials) => {
        setIsLoading(true);
        setError(null);

        // Simulate login
        setTimeout(() => {
            console.log('Login attempt:', data);
            setIsLoading(false);
            router.push('/dashboard');
        }, 1000);
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
    };

    const handleFacebookLogin = () => {
        console.log('Facebook login clicked');
    };

    return (
        <>
            <Head>
                <title>Log in to your Account - Klynaa</title>
                <meta name="description" content="Sign in to your Klynaa account" />
            </Head>

            <div className="min-h-screen flex bg-gray-50">
                {/* Left Panel - Login Form */}
                <div className="flex-1 flex items-center justify-center px-8 lg:px-12 bg-white">
                    <div className="max-w-sm w-full space-y-6">
                        {/* Header */}
                        <div className="text-left">
                            <div className="flex items-center space-x-2 mb-8">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">K</span>
                                </div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Klynaa
                                </h1>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Log in to your Account
                            </h2>
                            <p className="text-gray-600 text-sm mb-8">
                                Welcome back! Select method to log in:
                            </p>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">or continue with email</span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="rounded-lg p-3 bg-red-50 border border-red-200">
                                    <div className="text-red-800 text-sm">{error}</div>
                                </div>
                            )}

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        type="email"
                                        placeholder="Email"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters'
                                            }
                                        })}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"} />
                                        </svg>
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        {...register('rememberMe')}
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                            >
                                {isLoading ? 'Signing in...' : 'Log In'}
                            </button>
                        </form>

                        {/* Create account link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/auth/register-updated" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Blue Background */}
                <div className="hidden md:block md:w-1/2 bg-blue-600 relative">
                    {/* Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
                        <div className="absolute top-40 right-16 w-24 h-24 bg-white bg-opacity-5 rounded-full animate-bounce"></div>
                        <div className="absolute bottom-32 left-20 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 text-white">
                        {/* App Icons */}
                        <div className="mb-8">
                            <div className="flex space-x-4 mb-6">
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                </div>
                                <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Dashboard Preview */}
                            <div className="bg-white bg-opacity-10 rounded-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></div>
                                        <div className="w-16 h-2 bg-white bg-opacity-40 rounded"></div>
                                    </div>
                                    <div className="w-full h-2 bg-white bg-opacity-30 rounded mb-1"></div>
                                    <div className="w-3/4 h-2 bg-white bg-opacity-30 rounded"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-white bg-opacity-40 rounded-full"></div>
                                        <div className="w-20 h-2 bg-white bg-opacity-30 rounded"></div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-white bg-opacity-40 rounded-full"></div>
                                        <div className="w-16 h-2 bg-white bg-opacity-30 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div>
                            <h3 className="text-2xl font-bold mb-4">
                                Connect with every application.
                            </h3>
                            <p className="text-blue-100 text-lg max-w-md">
                                Everything you need in an easily customizable dashboard.
                            </p>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex space-x-2 mt-8">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
                            <div className="w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
