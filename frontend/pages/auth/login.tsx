import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores';
import { LoginCredentials, ApiError } from '../../types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="font-medium hover:underline" style={{ color: 'var(--color-black)' }}>
                            Register here
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
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="form-error">{errors.email.message}</p>
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
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className="form-input pr-12"
                                    placeholder="Enter your password"
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
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-green-500"
                                style={{ accentColor: '#16a34a' }}
                            />
                            <label htmlFor="remember-me" className="ml-2 block form-label mb-0">
                                Remember me
                            </label>
                        </div>

                        <div>
                            <a href="#" className="hover:underline form-label mb-0" style={{ color: 'var(--color-black)' }}>
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full flex justify-center items-center"
                        >
                            {isLoading ? (
                                <div className="spinner mr-2" />
                            ) : null}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
