import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for backend submission
    setSubmitted(true);
  };

  return (
    <>
      <Head>
        <title>Contact Us - Klynaa</title>
        <meta name="description" content="Contact Klynaa for waste management services, partnerships, or support." />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-green-600 py-16">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503596476-1c12a8ba09a7?auto=format&fit=crop&w=1350&q=80')] mix-blend-multiply bg-center bg-cover" />
          <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">Questions, partnerships, press, or support—we'd love to hear from you.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Contact Information</h2>
              <p className="text-gray-600">Reach us through any of the channels below.</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800">Email</h3>
                <p className="text-gray-600">support@klynaa.com</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Phone</h3>
                <p className="text-gray-600">+237 680 123 456</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Head Office</h3>
                <p className="text-gray-600">Douala, Cameroon</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Hours</h3>
                <p className="text-gray-600">Mon - Sat: 8:00 - 18:00</p>
              </div>
            </div>
            <div className="pt-6">
              <h3 className="font-medium text-gray-800 mb-2">Follow Us</h3>
              <div className="flex space-x-4 text-gray-500">
                <a href="#" className="hover:text-green-600">Twitter</a>
                <a href="#" className="hover:text-green-600">LinkedIn</a>
                <a href="#" className="hover:text-green-600">Facebook</a>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea name="message" rows={5} value={form.message} onChange={handleChange} required className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">Send Message</button>
                </form>
              ) : (
                <div className="text-center py-16">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Message Sent ✅</h2>
                  <p className="text-gray-600 mb-6">We will get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Send another</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-300 py-8 mt-16">
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

export default Contact;
