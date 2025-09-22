import React from 'react';
import Link from 'next/link';

export default function BillingTermsPage() {
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
          Billing Terms & Conditions
        </h1>

        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              1. Payment Methods
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
              We accept the following payment methods:
            </p>
            <ul className="text-neutral-600 dark:text-neutral-300 space-y-2 list-disc list-inside">
              <li>Mobile Money (MTN, Orange Money, etc.)</li>
              <li>Bank transfers (local and international)</li>
              <li>Cryptocurrency payments (Bitcoin, Ethereum)</li>
              <li>Credit/Debit cards (where available)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              2. Subscription Plans
            </h2>
            <div className="space-y-4">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Basic Plan - 5,000 CFA/month</h3>
                <ul className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Weekly waste pickup</li>
                  <li>Basic bin monitoring</li>
                  <li>Email support</li>
                </ul>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Premium Plan - 12,000 CFA/month</h3>
                <ul className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Bi-weekly waste pickup</li>
                  <li>Advanced bin monitoring with alerts</li>
                  <li>Priority support</li>
                  <li>Recycling services included</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              3. Billing Cycle
            </h2>
            <ul className="text-neutral-600 dark:text-neutral-300 space-y-2 list-disc list-inside">
              <li>Subscriptions are billed monthly in advance</li>
              <li>Pro-rated billing applies for mid-month starts</li>
              <li>Payment is due within 7 days of invoice date</li>
              <li>Late payments incur a 5% penalty fee</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              4. Refund Policy
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Refunds are available within 30 days of payment for unused services. Processing fees may apply depending on the payment method used. Refunds are processed within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              5. Service Fees
            </h2>
            <ul className="text-neutral-600 dark:text-neutral-300 space-y-2 list-disc list-inside">
              <li>Platform fee: 3% of transaction value</li>
              <li>Payment processing: 2.5% (varies by method)</li>
              <li>Currency conversion: Market rate + 1%</li>
              <li>No hidden fees - all charges are clearly displayed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              6. Account Suspension
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Services may be suspended for non-payment after 14 days. Account reactivation requires payment of outstanding balance plus any applicable fees. Data is retained for 90 days during suspension.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}