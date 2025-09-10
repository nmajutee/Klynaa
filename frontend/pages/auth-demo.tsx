import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const AuthDemo: React.FC = () => {
    return (
        <>
            <Head>
                <title>Authentication Demo - Klynaa</title>
                <meta name="description" content="Demo of Klynaa's modern authentication system" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-8">
                <div className="max-w-4xl w-full">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">K</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Klynaa Authentication System
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Modern, secure, and accessible login & registration system with worker reviews carousel
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern Design</h3>
                            <p className="text-gray-600">
                                Clean, modern interface with split-screen layout featuring forms on the left and worker reviews carousel on the right.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enhanced Security</h3>
                            <p className="text-gray-600">
                                Password strength validation, social login integration, and comprehensive form validation with CSRF protection.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M9 12h6m-6 4h6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessibility First</h3>
                            <p className="text-gray-600">
                                WCAG 2.1 AA compliant with keyboard navigation, screen reader support, and high contrast ratios.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Optimized</h3>
                            <p className="text-gray-600">
                                Fast loading times, smooth animations, and optimized bundle sizes with code splitting and lazy loading.
                            </p>
                        </div>
                    </div>

                    {/* Demo Links */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Try the Demo
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Link href="/auth/login" className="group">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">Login Page</h3>
                                            <p className="text-green-100">
                                                Experience the modern login interface with social authentication
                                            </p>
                                        </div>
                                        <svg className="w-8 h-8 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/auth/register-updated" className="group">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">Registration Page</h3>
                                            <p className="text-blue-100">
                                                Try the enhanced registration form with password strength validation
                                            </p>
                                        </div>
                                        <svg className="w-8 h-8 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Highlights</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Split-screen responsive layout
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Worker reviews carousel
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Real-time password validation
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Social login integration ready
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Database schema compliant
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Role-based redirection
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documentation Link */}
                    <div className="text-center mt-8">
                        <p className="text-gray-600 mb-4">
                            For detailed implementation documentation, check out:
                        </p>
                        <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow border border-gray-200">
                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-700 font-medium">AUTH_IMPLEMENTATION.md</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthDemo;
