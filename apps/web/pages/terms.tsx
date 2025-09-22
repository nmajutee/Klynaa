import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              By accessing and using Klynaa's waste management platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              2. Service Description
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Klynaa provides a digital platform connecting waste collectors with bin owners for efficient waste management services across Cameroon and other regions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              3. User Responsibilities
            </h2>
            <ul className="text-neutral-600 dark:text-neutral-300 space-y-2 list-disc list-inside">
              <li>Provide accurate and up-to-date information</li>
              <li>Use the service responsibly and legally</li>
              <li>Respect other users and service providers</li>
              <li>Follow local waste management regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              4. Payment Terms
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Payment terms and conditions are outlined in our billing policies. All transactions are processed securely through our payment partners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              5. Contact Us
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@klynaa.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}