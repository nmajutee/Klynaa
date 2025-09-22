import React from 'react';
import Link from 'next/link';
import { Icon } from '../components/ui/Icons';

export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: "Register Your Account",
      description: "Sign up as a bin owner, customer, or waste collection worker",
      icon: 'Users',
      color: "emerald"
    },
    {
      step: 2,
      title: "Connect with Workers",
      description: "Find verified waste collectors in your area or get matched automatically",
      icon: 'Truck',
      color: "blue"
    },
    {
      step: 3,
      title: "Schedule Pickup",
      description: "Set your preferred pickup times and frequency",
      icon: 'CheckCircle',
      color: "purple"
    },
    {
      step: 4,
      title: "Sustainable Management",
      description: "Track your waste impact and contribute to a cleaner environment",
      icon: 'Recycle',
      color: "green"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            How Klynaa Works
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            Our platform connects waste generators with professional collectors for efficient,
            sustainable waste management across Cameroon.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 md:gap-8">
            {steps.map((step, index) => {
              const colorClasses = {
                emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
                blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
                purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
                green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
              };

              return (
                <div key={step.step} className="flex flex-col md:flex-row items-center gap-8">
                  <div className={`w-16 h-16 ${colorClasses[step.color as keyof typeof colorClasses]} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon name={step.icon as any} className="w-8 h-8" />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                      <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                        STEP {step.step}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden md:block">
                      <Icon name="ArrowRight" className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            Why Choose Klynaa?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Reliable Service</h3>
              <p className="text-neutral-600 dark:text-neutral-300">Consistent, on-time waste collection you can depend on</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Verified Workers</h3>
              <p className="text-neutral-600 dark:text-neutral-300">All collectors are background-checked and verified</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon name="Recycle" className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Eco-Friendly</h3>
              <p className="text-neutral-600 dark:text-neutral-300">Contributing to sustainable waste management practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8">
            Join thousands of satisfied customers and workers on Klynaa
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Get Started Today
              <Icon name="ArrowRight" className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}