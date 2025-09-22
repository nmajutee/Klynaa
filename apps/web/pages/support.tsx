import React from 'react';
import Link from 'next/link';
import { Icon } from '../components/ui/Icons';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Support Center
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Get Help
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <Icon name="Mail" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Email Support</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-2">
                    Get help via email for non-urgent inquiries
                  </p>
                  <a
                    href="mailto:support@klynaa.com"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    support@klynaa.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Icon name="Phone" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Phone Support</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-2">
                    Call us for urgent issues (Mon-Fri, 8AM-6PM)
                  </p>
                  <a
                    href="tel:+237123456789"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    +237 123 456 789
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Icon name="MessageCircle" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Live Chat</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-2">
                    Chat with our support team in real-time
                  </p>
                  <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  How do I schedule a pickup?
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                  Log into your dashboard and use the "Schedule Pickup" button to request waste collection.
                </p>
              </div>

              <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  How do workers get verified?
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                  Complete the worker registration process including identity verification and background checks.
                </p>
              </div>

              <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  What payment methods are accepted?
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                  We accept mobile money, bank transfers, and cryptocurrency payments.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  How can I track my bins?
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                  Use the bin monitoring feature in your dashboard to check fill levels and pickup status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}