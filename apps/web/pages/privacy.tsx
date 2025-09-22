import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="text-neutral-600 dark:text-neutral-300 space-y-2 list-disc list-inside">
              <li>To provide, maintain, and improve our services</li>
              <li>To process transactions and send related information</li>
              <li>To communicate with you about services and updates</li>
              <li>To ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              3. Information Sharing
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              4. Data Security
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              5. Contact Us
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@klynaa.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}