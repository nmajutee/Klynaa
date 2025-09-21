import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { Input, Label, Field } from '../../src/design-system/components/Form';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      // Mock authentication with role-based responses
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user database
      const mockUsers: Record<string, { id: string; email: string; name: string; role: 'worker' | 'customer' | 'admin' }> = {
        'worker@klynaa.com': { id: '1', email: 'worker@klynaa.com', name: 'Jean-Claude Kamga', role: 'worker' },
        '+237123456789': { id: '1', email: 'worker@klynaa.com', name: 'Jean-Claude Kamga', role: 'worker' },
        'binowner@klynaa.com': { id: '2', email: 'binowner@klynaa.com', name: 'Marie Nkomo', role: 'customer' },
        '+237987654321': { id: '2', email: 'binowner@klynaa.com', name: 'Marie Nkomo', role: 'customer' },
        'admin@klynaa.com': { id: '3', email: 'admin@klynaa.com', name: 'Paul Biya', role: 'admin' },
        '+237555123456': { id: '3', email: 'admin@klynaa.com', name: 'Paul Biya', role: 'admin' }
      };

      // Check credentials
      const user = mockUsers[data.identifier.toLowerCase()];
      const validPasswords = ['password123', 'admin123'];

      if (!user || !validPasswords.includes(data.password)) {
        throw new Error('Invalid credentials');
      }

      // Store user data
      localStorage.setItem('klynaa_user', JSON.stringify(user));

      // Role-based redirect
      switch (user.role) {
        case 'worker':
          router.push('/worker/dashboard');
          break;
        case 'customer':
          router.push('/customer/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error) {
      setError('Invalid email/phone or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600">
              Sign in to your Klynaa account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email/Username */}
            <Field label="Email or Username" error={errors.identifier?.message}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  {...register('identifier')}
                  placeholder="Enter your email or username"
                  className="pl-10"
                  error={errors.identifier?.message}
                />
              </div>
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
            </Field>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              {(isSubmitting || isLoading) ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Create Account
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-neutral-300" />
            <div className="mx-4 text-sm text-neutral-500">OR</div>
            <div className="flex-1 border-t border-neutral-300" />
          </div>

          {/* Test Links */}
          <div className="mt-6 space-y-2">
            <Link
              href="/auth-test"
              className="block w-full text-center py-2 px-4 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 text-sm"
            >
              Test API Connection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}