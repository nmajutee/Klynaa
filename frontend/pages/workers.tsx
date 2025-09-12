import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    CurrencyDollarIcon,
    ClockIcon,
    UserGroupIcon,
    MapPinIcon,
    StarIcon,
    TruckIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    CalendarDaysIcon,
    ShieldCheckIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

const Workers: React.FC = () => {
    const benefits = [
        {
            title: "Flexible Schedule",
            description: "Work when you want, where you want. Set your own hours.",
            icon: ClockIcon,
            color: "bg-klynaa-secondary"
        },
        {
            title: "Good Earnings",
            description: "Earn competitive rates with tips and bonuses.",
            icon: CurrencyDollarIcon,
            color: "bg-klynaa-primary"
        },
        {
            title: "Growing Community",
            description: "Join thousands of workers across Cameroon.",
            icon: UserGroupIcon,
            color: "bg-klynaa-tertiary"
        },
        {
            title: "Local Work",
            description: "Work in your neighborhood and nearby areas.",
            icon: MapPinIcon,
            color: "bg-klynaa-dark"
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Sign Up",
            description: "Create your worker profile and upload required documents",
            icon: UserGroupIcon
        },
        {
            step: "2",
            title: "Get Verified",
            description: "Complete our verification process (1-2 business days)",
            icon: ShieldCheckIcon
        },
        {
            step: "3",
            title: "Start Working",
            description: "Accept pickup requests and start earning immediately",
            icon: TruckIcon
        },
        {
            step: "4",
            title: "Get Paid",
            description: "Receive payments weekly through mobile money or bank transfer",
            icon: CurrencyDollarIcon
        }
    ];

    const requirements = [
        "Valid Cameroon ID or passport",
        "Mobile phone with internet access",
        "Basic transportation (motorcycle, bicycle, or vehicle)",
        "Physical ability to handle waste materials",
        "Clean background check",
        "Basic French or English communication"
    ];

    const testimonials = [
        {
            name: "Paul Biya Jr.",
            location: "Douala",
            earnings: "185,000 XAF/month",
            content: "Working with Klynaa has given me financial independence. I can support my family while helping keep our city clean.",
            rating: 5,
            avatar: "PB"
        },
        {
            name: "Aisha Mbangue",
            location: "Yaoundé",
            earnings: "220,000 XAF/month",
            content: "The flexible schedule allows me to work around my other commitments. Great platform for extra income.",
            rating: 5,
            avatar: "AM"
        },
        {
            name: "Jean-Claude Kamdem",
            location: "Bamenda",
            earnings: "165,000 XAF/month",
            content: "I love that I'm making a positive impact on the environment while earning good money. Highly recommend!",
            rating: 5,
            avatar: "JK"
        }
    ];

    return (
        <>
            <Head>
                <title>Work With Klynaa - Earn Money as a Waste Pickup Worker</title>
                <meta name="description" content="Join Klynaa's network of waste pickup workers in Cameroon. Flexible work, good earnings, and make a positive environmental impact." />
                <meta name="keywords" content="waste pickup jobs Cameroon, environmental work, flexible income, Douala jobs, Yaoundé employment" />
            </Head>

            <div className="min-h-screen bg-white">
                {/* Navigation */}
                <nav className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <ArrowPathIcon className="h-8 w-8 text-green-600 mr-2" />
                                    <span className="text-2xl font-bold text-gray-900">Klynaa</span>
                                </Link>
                            </div>

                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <Link href="/services" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Services
                                    </Link>
                                    <Link href="/locations" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Locations
                                    </Link>
                                    <Link href="/workers" className="text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                                        For Workers
                                    </Link>
                                    <Link href="/about" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                                        About
                                    </Link>
                                    <Link href="/blog" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Blog
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Sign In
                                </Link>
                                <Link href="/auth/register?role=worker" className="btn-primary">
                                    Join as Worker
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                <span className="block">Earn Money While</span>
                                <span className="block text-green-600">Protecting Our Environment</span>
                            </h1>
                            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                Join Klynaa's network of verified waste pickup workers. Flexible work, competitive earnings, and make a positive impact on your community.
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/auth/register?role=worker" className="btn-primary text-lg px-8 py-4">
                                    Start Earning Today
                                </Link>
                                <button className="btn-secondary text-lg px-8 py-4">
                                    Learn More
                                </button>
                            </div>

                            {/* Earnings Highlight */}
                            <div className="mt-12 bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">150,000 - 300,000 XAF</div>
                                    <div className="text-gray-500">Average monthly earnings</div>
                                    <div className="text-sm text-gray-400 mt-2">Based on 20-30 hours/week</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Why Work With Klynaa?
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Join thousands of workers who have found flexible, meaningful work
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="text-center">
                                    <div className={`inline-flex items-center justify-center p-4 ${benefit.color} rounded-lg mb-4`}>
                                        <benefit.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                    <p className="text-gray-500">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                How to Get Started
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Simple steps to start earning with Klynaa
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {howItWorks.map((step, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                                        <step.icon className="h-8 w-8" />
                                    </div>
                                    <div className="text-lg font-medium text-gray-900 mb-2">
                                        Step {step.step}: {step.title}
                                    </div>
                                    <p className="text-gray-500">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Requirements */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                                    Worker Requirements
                                </h2>
                                <p className="text-xl text-gray-500 mb-8">
                                    We maintain high standards to ensure quality service for our customers and fair opportunities for our workers.
                                </p>
                                <ul className="space-y-4">
                                    {requirements.map((requirement, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                                            <span className="text-gray-700">{requirement}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <Link href="/auth/register?role=worker" className="btn-primary">
                                        Apply Now
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">What You'll Need</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <AcademicCapIcon className="h-6 w-6 text-blue-500 mr-3" />
                                        <span className="text-gray-700">Training provided</span>
                                    </div>
                                    <div className="flex items-center">
                                        <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
                                        <span className="text-gray-700">Insurance coverage</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CalendarDaysIcon className="h-6 w-6 text-purple-500 mr-3" />
                                        <span className="text-gray-700">Flexible scheduling</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-16 bg-green-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Worker Success Stories
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Hear from real workers earning with Klynaa
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                            <span className="text-green-600 font-semibold">{testimonial.avatar}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                            <div className="text-gray-500 text-sm">{testimonial.location}</div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-lg font-semibold text-green-600">{testimonial.earnings}</div>
                                        <div className="flex items-center">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-gray-700">"{testimonial.content}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-green-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Ready to Start Earning?
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto">
                            Join our community of environmental workers and start making a difference today.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/auth/register?role=worker" className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Apply to Become a Worker
                            </Link>
                            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Have Questions?
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-4">
                                    <ArrowPathIcon className="h-8 w-8 text-green-500 mr-2" />
                                    <span className="text-2xl font-bold">Klynaa</span>
                                </div>
                                <p className="text-gray-300 mb-4">
                                    Smart waste management for a cleaner Cameroon. Creating jobs while protecting our environment.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">For Workers</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/workers/register" className="text-gray-300 hover:text-white">Apply Now</Link></li>
                                    <li><Link href="/workers/login" className="text-gray-300 hover:text-white">Worker Login</Link></li>
                                    <li><Link href="/workers/support" className="text-gray-300 hover:text-white">Support</Link></li>
                                    <li><Link href="/workers/training" className="text-gray-300 hover:text-white">Training</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Company</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                                    <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
                                    <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                                    <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                            <p className="text-gray-300">
                                &copy; 2025 Klynaa. All rights reserved. Building a sustainable future for Cameroon.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Workers;
