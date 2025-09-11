import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Privacy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Klynaa</title>
        <meta name="description" content="Klynaa Privacy Policy explaining how we collect, use, and protect data." />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-700 py-16 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-green-100 max-w-2xl mx-auto">Transparency in how we protect user, operational, and environmental data.</p>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Data We Collect</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Account info: name, email, role, and verification status.</li>
              <li>Operational data: bin capacity readings, pickup timestamps, route activity.</li>
              <li>Geolocation (workers): only during active pickup sessions for validation.</li>
              <li>Evidence data: photos for bin fill level & completion proof.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Data</h2>
            <p className="text-gray-600">Improve pickup routing efficiency, detect fraud, generate sustainability analytics, and facilitate dispute resolution.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Legal Basis</h2>
            <p className="text-gray-600">Processing is based on legitimate interest (platform operation), contract performance (service delivery), and consent (notifications & analytics opt-ins).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Retention</h2>
            <p className="text-gray-600">Pickup and operational records retained for up to 36 months for compliance & analytics, then aggregated or anonymized.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Security</h2>
            <p className="text-gray-600">We apply encryption in transit (HTTPS), access controls, audit logging, and anomaly detection baselines for location & proof authenticity.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Sharing</h2>
            <p className="text-gray-600">We do not sell personal data. Limited sharing occurs with payment processors, cloud infrastructure, and optional sustainability partners (aggregated only).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. User Rights</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Access & export your data.</li>
              <li>Request correction or deletion (unless retention obligations apply).</li>
              <li>Opt out of non-essential notifications and analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Children</h2>
            <p className="text-gray-600">The platform is not intended for individuals under 16. We do not knowingly process minor data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Updates</h2>
            <p className="text-gray-600">Policy changes will appear here with a revised effective date. Continued use implies acceptance.</p>
          </section>

          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <p className="text-sm text-gray-600">Data requests: <span className="font-medium">privacy@klynaa.com</span></p>
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

export default Privacy;
