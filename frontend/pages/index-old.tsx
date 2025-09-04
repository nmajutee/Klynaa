import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores';
import Link from 'next/link';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Redirect authenticated users to dashboard
        if (isAuthenticated && user) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, user, router]);

    if (isAuthenticated) {
        // Show loading while redirecting
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-primary-600">Klynaa</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                                Sign In
                            </Link>
                            <Link href="/auth/register" className="btn-primary">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">Modern Waste</span>
                        <span className="block text-primary-600">Management for Cameroon</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Connect with reliable waste pickup services in your area. Smart, efficient, and eco-friendly waste management made simple.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <div className="rounded-md shadow">
                            <Link href="/auth/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
                                Get Started
                            </Link>
                        </div>
                        <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                            <Link href="/auth/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-20">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="mt-6 text-lg font-medium text-gray-900">Smart Bin Management</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Monitor your waste bins in real-time with fill level tracking and automated pickup requests.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h3 className="mt-6 text-lg font-medium text-gray-900">Reliable Pickups</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Connect with verified waste pickup workers in your area for timely and efficient service.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Payments</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Safe and secure payment processing with escrow protection for all transactions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 bg-primary-600 rounded-lg">
                    <div className="px-6 py-6 sm:px-6 sm:py-12 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Ready to get started?
                            </h2>
                            <p className="mt-3 text-xl text-primary-100">
                                Join thousands of users already using Klynaa for their waste management needs.
                            </p>
                            <div className="mt-8">
                                <Link href="/auth/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50">
                                    Sign up for free
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-500">
                        <p>&copy; 2025 Klynaa. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
