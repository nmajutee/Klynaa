import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Icons, WasteIcons } from '../../components/ui/Icons';

interface ForgotPasswordForm {
    email: string;
}

const ForgotPassword: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>();

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true);

        try {
            // TODO: Integrate with backend endpoint when available
            console.log('Password reset request:', data);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSuccess(true);
        } catch (error) {
            console.error('Password reset error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Forgot Password - Klynaa</title>
                <meta name="description" content="Reset your Klynaa account password" />
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
                                    <div className="w-6 h-6 bg-klynaa-primary rounded flex items-center justify-center">
                                        <WasteIcons.recycling className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold text-klynaa-dark font-sans">Klynaa</span>
                                </div>

                                {success ? (
                                    // Success State
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Icons.checkCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h2 className="text-[28px] leading-tight font-bold text-klynaa-dark mb-2 font-sans">Check your email</h2>
                                        <p className="text-[15px] text-klynaa-neutral mb-8 font-sans">
                                            We've sent a password reset link to your email address.
                                        </p>
                                        <Link
                                            href="/auth/login"
                                            className="w-full h-11 flex justify-center items-center rounded-[8px] bg-klynaa-primary hover:bg-klynaa-darkgreen text-white font-medium text-sm transition-colors font-sans"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Heading */}
                                        <h2 className="text-[28px] leading-tight font-bold text-klynaa-dark mb-2 font-sans">Forgot your password?</h2>
                                        <p className="text-[15px] text-klynaa-neutral mb-8 font-sans">Enter your email and we'll send you a reset link.</p>

                                        {/* Form */}
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                                            {/* Email */}
                                            <div>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                        <Icons.mail className="h-4 w-4 text-gray-400" />
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
                                                        className="block w-full h-11 pl-9 pr-3 rounded-[8px] border border-gray-200 bg-white placeholder-gray-400 text-klynaa-dark text-sm font-sans focus:outline-none focus:ring-1 focus:ring-klynaa-primary focus:border-klynaa-primary"
                                                        aria-invalid={errors.email ? 'true' : 'false'}
                                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p id="email-error" className="mt-1 text-sm text-red-600 font-sans">{errors.email.message}</p>
                                                )}
                                            </div>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full h-11 mt-6 flex justify-center items-center rounded-[8px] bg-klynaa-primary hover:bg-klynaa-darkgreen text-white font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-sans"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Icons.loader className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                                                        Sending reset link...
                                                    </>
                                                ) : (
                                                    'Send Reset Link'
                                                )}
                                            </button>
                                        </form>

                                        {/* Bottom Link */}
                                        <p className="mt-6 text-center text-sm text-gray-600 font-sans">
                                            Remembered your password?
                                            {' '}
                                            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-sans">Back to login</Link>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: Visual Panel */}
                        <div className="relative bg-klynaa-primary flex items-center justify-center overflow-hidden">
                            {/* Background decorative elements */}
                            <div className="absolute inset-0">
                                {/* Large background circle */}
                                <div className="absolute top-8 right-8 w-80 h-80 rounded-full border border-white/10"></div>
                                <div className="absolute top-16 right-16 w-64 h-64 rounded-full border border-white/5"></div>

                                {/* Floating app icons */}
                                <div className="absolute top-20 right-32">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <div className="w-6 h-6 bg-gradient-to-br from-klynaa-darkgreen to-klynaa-primary rounded-lg flex items-center justify-center">
                                            <WasteIcons.recycling className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-36 right-20">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold font-sans">f</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-52 right-36">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold font-sans">G</span>
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

                                <h3 className="text-2xl font-semibold mb-2 font-sans">Connect with every application.</h3>
                                <p className="text-white/80 text-base mb-8 font-sans">Everything you need in an easily customizable dashboard.</p>

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

export default ForgotPassword;