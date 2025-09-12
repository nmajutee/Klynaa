import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Terms: React.FC = () => {
  return (
    <>
      <Head>
        <title>Terms of Service - Klynaa</title>
        <meta name="description" content="Klynaa Terms of Service agreement covering platform use, responsibilities, and limitations." />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-klynaa-darkgreen py-16 text-center text-white">
          <h1 className="text-4xl klynaa-heading text-white mb-4">Terms of Service</h1>
          <p className="text-green-100 max-w-2xl mx-auto klynaa-body">Effective Date: Sept 1, 2025</p>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-klynaa-darkgreen mb-4">1. Introduction</h2>
            <p className="text-klynaa-neutral">These Terms govern your access to and use of the Klynaa platform, including mobile, web, and API services for waste management, bin monitoring, pickup coordination, and payments.</p>
          </section>

            <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Roles & Responsibilities</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>Bin Owners</strong>: Maintain accessible and safe bin environments.</li>
              <li><strong>Workers</strong>: Complete assigned pickups honestly and safely.</li>
              <li><strong>Admins</strong>: Moderate disputes, verify workers, and ensure system integrity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Accounts & Access</h2>
            <p className="text-gray-600">You agree to provide accurate registration information. Role-based access may be restricted pending verification or compliance requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Payments & Escrow</h2>
            <p className="text-gray-600">All service payments may be held in escrow until confirmation of pickup completion. Disputes are resolved by admin review using photo proof and system records.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Prohibited Activities</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Submitting falsified pickup proof (photos or GPS location).</li>
              <li>Interfering with bin sensors, QR tags, or verification systems.</li>
              <li>Unauthorized scraping or misuse of platform APIs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Data Usage</h2>
            <p className="text-gray-600">We process operational, geolocation, and environmental data to improve waste collection efficiency and sustainability insights. See <Link href="/privacy" className="text-green-600 hover:text-green-700">Privacy Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600">Klynaa is not responsible for indirect damages, illegal dumping actions by third parties, or delays caused by environmental or infrastructural challenges beyond our control.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Termination</h2>
            <p className="text-gray-600">We reserve the right to suspend or terminate accounts violating these Terms or engaging in fraudulent, harmful, or unlawful behavior.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Updates</h2>
            <p className="text-gray-600">We may update these Terms periodically. Continued use of the platform after updates constitutes acceptance.</p>
          </section>

          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <p className="text-sm text-gray-600">Questions? Contact us at <span className="font-medium">legal@klynaa.com</span>.</p>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-300 py-8">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">© {new Date().getFullYear()} Klynaa. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
