import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Icons, WasteIcons, MobileIcons, StatusIcon } from '../components/ui/Icons';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
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
      <div className="min-h-screen bg-klynaa-lightgray">
        {/* Hero Header - Dark Green Background */}
        <div className="relative bg-klynaa-darkgreen py-16">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503596476-1c12a8ba09a7?auto=format&fit=crop&w=1350&q=80')] opacity-20 mix-blend-multiply bg-center bg-cover" />
          <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
            <h1 className="text-5xl font-bold text-white mb-4" style={{fontFamily: 'Arimo, sans-serif'}}>Get in Touch</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto klynaa-body opacity-90">Questions, partnerships, press, or support—we'd love to hear from you.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
          {/* Contact Information Card */}
          <div className="md:col-span-1 space-y-8">
            <div className="klynaa-card p-6">
              <h2 className="text-2xl klynaa-subheading mb-3">Contact Information</h2>
              <p className="klynaa-body mb-6">Reach us through any of the channels below.</p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-klynaa-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Icons.mail size="md" color="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-klynaa-dark mb-1">Email</h3>
                    <p className="klynaa-body">support@klynaa.com</p>
                    <p className="klynaa-caption">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-klynaa-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Icons.phone size="md" color="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-klynaa-dark mb-1">Phone</h3>
                    <p className="klynaa-body">+237 672 601 638</p>
                    <p className="klynaa-caption">Available during business hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-klynaa-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Icons.mapPin size="md" color="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-klynaa-dark mb-1">Head Office</h3>
                    <p className="klynaa-body">Buea, Cameroon</p>
                    <p className="klynaa-caption">Environmental Technology Hub</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-klynaa-yellow rounded-full flex items-center justify-center flex-shrink-0">
                    <Icons.clock size="md" color="dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-klynaa-dark mb-1">Business Hours</h3>
                    <p className="klynaa-body">Mon - Sat: 8:00 - 18:00</p>
                    <p className="klynaa-caption">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <h3 className="font-medium text-klynaa-dark mb-2">Follow Us</h3>
              <div className="flex space-x-4 text-klynaa-graylabel">
                <a href="#" className="hover:text-klynaa-primary">Twitter</a>
                <a href="#" className="hover:text-klynaa-primary">LinkedIn</a>
                <a href="#" className="hover:text-klynaa-primary">Facebook</a>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="md:col-span-2">
            <div className="klynaa-card p-8">
              <div className="mb-8">
                <h2 className="text-3xl klynaa-subheading mb-3">Send us a Message</h2>
                <p className="klynaa-body">Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="klynaa-label block mb-2">Full Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="klynaa-input w-full"
                      />
                    </div>
                    <div>
                      <label className="klynaa-label block mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                        className="klynaa-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="klynaa-label block mb-2">Subject</label>
                    <select className="klynaa-input w-full">
                      <option>General Inquiry</option>
                      <option>Partnership Opportunity</option>
                      <option>Technical Support</option>
                      <option>Press & Media</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="klynaa-label block mb-2">Message *</label>
                    <textarea
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help you..."
                      className="klynaa-input w-full resize-none"
                    />
                    <p className="klynaa-caption mt-1">Please provide as much detail as possible to help us assist you better.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button type="submit" className="klynaa-btn-primary flex-1 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                      <Icons.mail size="sm" color="white" />
                      <span>Send Message</span>
                    </button>
                    <button type="button" className="klynaa-btn-secondary flex-1 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                      <Icons.plus size="sm" />
                      <span>Save as Draft</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-klynaa-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icons.check size="xxl" color="white" />
                  </div>
                  <h2 className="text-3xl klynaa-subheading mb-4">Message Sent Successfully!</h2>
                  <p className="klynaa-body mb-2">Thank you for reaching out to us.</p>
                  <p className="klynaa-caption mb-8">We will get back to you within 24 hours during business days.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                      className="klynaa-btn-primary px-8 py-3 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Icons.plus size="sm" color="white" />
                      <span>Send Another Message</span>
                    </button>
                    <Link href="/" className="klynaa-btn-secondary px-8 py-3 rounded-lg flex items-center justify-center space-x-2">
                      <Icons.home size="sm" />
                      <span>Back to Home</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Klynaa Design System Showcase Section */}
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl klynaa-heading mb-4">Klynaa Iconography System</h2>
              <p className="text-xl klynaa-body max-w-3xl mx-auto">Experience our comprehensive iconography designed for clarity, accessibility, and environmental consciousness.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Lucide Icons (Primary UI) */}
              <div className="klynaa-card p-6">
                <h3 className="klynaa-card-header text-lg mb-4 flex items-center">
                  <Icons.dashboard size="md" color="primary" className="mr-2" />
                  Primary UI Icons
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Icons.dashboard size="md" color="neutral" />
                    <span className="text-sm klynaa-body">Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icons.users size="md" color="neutral" />
                    <span className="text-sm klynaa-body">Team</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icons.barChart size="md" color="neutral" />
                    <span className="text-sm klynaa-body">Analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icons.dollar size="md" color="neutral" />
                    <span className="text-sm klynaa-body">Earnings</span>
                  </div>
                </div>
              </div>

              {/* Domain-Specific Icons (Remix) */}
              <div className="klynaa-card p-6">
                <h3 className="klynaa-card-header text-lg mb-4 flex items-center">
                  <WasteIcons.recycling size="md" color="primary" filled className="mr-2" />
                  Waste Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <WasteIcons.bin size="md" color="neutral" filled />
                    <span className="text-sm klynaa-body">Waste Bin</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <WasteIcons.truck size="md" color="neutral" filled />
                    <span className="text-sm klynaa-body">Truck</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <WasteIcons.recycling size="md" color="neutral" filled />
                    <span className="text-sm klynaa-body">Recycling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <WasteIcons.leaf size="md" color="neutral" filled />
                    <span className="text-sm klynaa-body">Eco-Friendly</span>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="klynaa-card p-6">
                <h3 className="klynaa-card-header text-lg mb-4 flex items-center">
                  <Icons.check size="md" color="primary" className="mr-2" />
                  Status System
                </h3>
                <div className="space-y-4">
                  <StatusIcon status="available" showText />
                  <StatusIcon status="full" showText />
                  <StatusIcon status="pending" showText />
                  <StatusIcon status="completed" showText />
                </div>
              </div>

              {/* Mobile Icons */}
              <div className="klynaa-card p-6">
                <h3 className="klynaa-card-header text-lg mb-4 flex items-center">
                  <MobileIcons.star size="md" color="primary" filled className="mr-2" />
                  Mobile Friendly
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MobileIcons.star size="md" color="neutral" filled />
                    <span className="text-sm klynaa-body">Rating</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MobileIcons.heart size="md" color="neutral" />
                    <span className="text-sm klynaa-body">Favorite</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MobileIcons.thumbsUp size="md" color="neutral" />
                    <span className="text-sm klynaa-body">Like</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MobileIcons.smiley size="md" color="neutral" />
                    <span className="text-sm klynaa-body">Happy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Icon Design Principles */}
            <div className="klynaa-card p-8">
              <h3 className="klynaa-card-header text-xl mb-6 flex items-center">
                <Icons.info size="md" color="primary" className="mr-2" />
                Design Principles
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-klynaa-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.check size="xl" color="primary" />
                  </div>
                  <h4 className="font-semibold text-klynaa-dark mb-2">Clarity First</h4>
                  <p className="klynaa-caption">Icons reinforce meaning, never confuse</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-klynaa-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <WasteIcons.leaf size="xl" color="primary" filled />
                  </div>
                  <h4 className="font-semibold text-klynaa-dark mb-2">Eco-Conscious</h4>
                  <p className="klynaa-caption">Domain-specific symbols for waste management</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-klynaa-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.users size="xl" color="primary" />
                  </div>
                  <h4 className="font-semibold text-klynaa-dark mb-2">Accessible</h4>
                  <p className="klynaa-caption">ARIA labels and high contrast support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Dark Green Background */}
        <div className="bg-klynaa-darkgreen text-white py-12 mt-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4" style={{fontFamily: 'Arimo, sans-serif'}}>Klynaa</h3>
                <p className="text-green-100 text-sm">Revolutionizing waste management through technology and community engagement.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-klynaa-yellow">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="text-green-100 hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/services" className="text-green-100 hover:text-white transition-colors">Services</Link></li>
                  <li><Link href="/about" className="text-green-100 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="text-white font-medium">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-klynaa-yellow">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/terms" className="text-green-100 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="text-green-100 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><a href="mailto:support@klynaa.com" className="text-green-100 hover:text-white transition-colors">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-klynaa-yellow">Connect</h4>
                <div className="flex space-x-4">
                  <a href="#" className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                    <span className="text-xs">T</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                    <span className="text-xs">L</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                    <span className="text-xs">F</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-green-600 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-green-200">© {new Date().getFullYear()} Klynaa. All rights reserved.</p>
              <p className="text-xs text-green-300">Made with 💚 for a cleaner world</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
