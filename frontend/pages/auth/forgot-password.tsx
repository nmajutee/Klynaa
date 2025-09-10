import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface ForgotForm { email: string }

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    // TODO: Integrate with backend endpoint when available
    console.log('Password reset request:', data);
    alert('If an account with that email exists, a reset link will be sent.');
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Klynaa</title>
        <meta name="description" content="Reset your Klynaa account password" />
      </Head>

      <div className="min-h-screen w-full bg-[#F5F6FA] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Klynaa</h1>
          </div>

          <h2 className="text-[24px] leading-7 font-semibold text-[#1E1E1E]">Forgot your password?</h2>
          <p className="mt-2 text-[14px] text-[#6B7280]">Enter your email and we’ll send you a reset link.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })}
                  type="email"
                  placeholder="Email"
                  className="block w-full h-12 pl-10 pr-3 rounded-md border border-gray-200 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full h-12 flex justify-center items-center rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            Remembered your password?{' '}
            <Link href="/auth/login" className="text-[#2563EB] hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </>
  );
}
