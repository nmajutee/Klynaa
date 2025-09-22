import React from 'react';
import { Icon } from '../../components/ui/Icons';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Join Klynaa
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Choose your account type to get started with waste management made simple
            </p>
          </div>
        </div>

        {/* Account Type Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Worker Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Icon name="User" size={32} color="#16A34A" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Worker
              </h2>
              <p className="text-neutral-600 mb-6">
                Join our network of waste collection professionals and earn money helping your community
              </p>
            </div>

            {/* Worker Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Icon name="Clock" size={12} color="#16A34A" />
                </div>
                <span className="text-sm text-neutral-700">Flexible working hours</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Icon name="Zap" size={12} color="#16A34A" />
                </div>
                <span className="text-sm text-neutral-700">Instant earnings with secure payments</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Icon name="MapPin" size={12} color="#16A34A" />
                </div>
                <span className="text-sm text-neutral-700">Work in your local area</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Icon name="Shield" size={12} color="#16A34A" />
                </div>
                <span className="text-sm text-neutral-700">Verified and trusted platform</span>
              </div>
            </div>

            <Link
              href="/auth/register/worker"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
            >
              Start as Worker
              <Icon name="ArrowRight" size={20} />
            </Link>
          </div>

          {/* Bin Owner Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Icon name="Briefcase" size={32} color="#2563EB" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Bin Owner
              </h2>
              <p className="text-neutral-600 mb-6">
                Register your bins and enjoy convenient, reliable waste collection services
              </p>
            </div>

            {/* Bin Owner Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Clock" size={12} color="#2563EB" />
                </div>
                <span className="text-sm text-neutral-700">Scheduled pickup services</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Zap" size={12} color="#2563EB" />
                </div>
                <span className="text-sm text-neutral-700">Smart bin monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="MapPin" size={12} color="#2563EB" />
                </div>
                <span className="text-sm text-neutral-700">Real-time tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Shield" size={12} color="#2563EB" />
                </div>
                <span className="text-sm text-neutral-700">Secure payment system</span>
              </div>
            </div>

            <Link
              href="/auth/register/bin-owner"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
            >
              Start as Bin Owner
              <Icon name="ArrowRight" size={20} />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-neutral-600 mb-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign In
            </Link>
          </p>
          <p className="text-sm text-neutral-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-neutral-700 hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-neutral-700 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}