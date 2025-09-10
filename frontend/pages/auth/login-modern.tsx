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

            <div className="min-h-screen flex bg-gray-100">
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
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Google
                            </button>

                            <button
                                type="button"
                                onClick={handleFacebookLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
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
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
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
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
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
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                        Forgot Password?
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Signing in...' : 'Log In'}
                            </button>
                        </form>

                        {/* Create account link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/auth/register-updated" className="font-medium text-blue-600 hover:text-blue-500">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Blue Background */}
                <div className="hidden md:block md:w-1/2 bg-blue-600">
                    <div className="h-full flex flex-col items-center justify-center text-center px-8 text-white">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                                <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full"></div>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-4">
                            Connect with every application.
                        </h3>
                        <p className="text-blue-100 text-lg max-w-md">
                            Everything you need in an easily customizable dashboard.
                        </p>

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
