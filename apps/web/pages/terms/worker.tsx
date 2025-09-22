import React from 'react';
import Link from 'next/link';

export default function WorkerTermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/terms"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            ← Back to General Terms
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Worker Terms & Conditions
        </h1>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              1. Worker Agreement
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              By registering as a waste collection worker on Klynaa, you agree to provide reliable and professional waste management services to bin owners in accordance with local regulations and our platform standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              2. Worker Responsibilities
            </h2>
            <ul className="text-neutral-600 dark:text-neutral-300 space-y-2 list-disc list-inside">
              <li>Maintain professional conduct and appearance</li>
              <li>Complete pickups as scheduled and confirmed</li>
              <li>Handle waste according to environmental regulations</li>
              <li>Maintain accurate records of collections</li>
              <li>Report any issues or incidents promptly</li>
              <li>Keep verification documents current</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              3. Verification Requirements
            </h2>
            <ul className="text-neutral-600 dark:text-neutral-300 space-y-2 list-disc list-inside">
              <li>Valid government-issued identification</li>
              <li>Background check clearance</li>
              <li>Proof of waste handling training (where required)</li>
              <li>Equipment safety certification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              4. Payment Terms
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Workers are paid based on completed collections. Payment processing occurs weekly through the platform's payment system. A small service fee is deducted from each transaction to support platform operations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              5. Performance Standards
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Workers must maintain a minimum rating of 4.0/5.0 and complete at least 90% of accepted pickup requests. Failure to meet these standards may result in account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              6. Safety & Insurance
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Workers are responsible for their own safety equipment and insurance coverage. Klynaa provides general platform insurance but individual workers should maintain appropriate liability coverage.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}