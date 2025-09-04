import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthStore } from '../stores';
import {
    MagnifyingGlassIcon,
    TruckIcon,
    UserGroupIcon,
    MapPinIcon,
    SparklesIcon,
    CheckCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    HomeIcon,
    ClockIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Redirect authenticated users to dashboard
        if (isAuthenticated && user) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, user, router]);

    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    const services = [
        {
            title: "Household Waste",
            description: "Regular pickup for home waste and recycling",
            icon: HomeIcon,
            href: "/services/household",
            color: "bg-green-500"
        },
        {
            title: "Commercial Waste",
            description: "Business waste management solutions",
            icon: BuildingOfficeIcon,
            href: "/services/commercial",
            color: "bg-blue-500"
        },
        {
            title: "Recycling",
            description: "Eco-friendly recycling services",
            icon: ArrowPathIcon,
            href: "/services/recycling",
            color: "bg-emerald-500"
        },
        {
            title: "Urgent Pickup",
            description: "Same-day waste collection",
            icon: BoltIcon,
            href: "/services/urgent",
            color: "bg-orange-500"
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Request Pickup",
            description: "Book a waste pickup service in your area",
            icon: PhoneIcon
        },
        {
            step: "2",
            title: "Worker Accepts",
            description: "Verified workers accept your request",
            icon: UserGroupIcon
        },
        {
            step: "3",
            title: "Waste Collected",
            description: "Professional pickup and disposal",
            icon: TruckIcon
        },
        {
            step: "4",
            title: "Reward Impact",
            description: "Track your environmental contribution",
            icon: SparklesIcon
        }
    ];

    const testimonials = [
        {
            name: "Marie Ngono",
            role: "Homeowner, Douala",
            content: "Klynaa has made waste management so easy for our family. The workers are professional and always on time.",
            rating: 5
        },
        {
            name: "Jean-Claude Mbida",
            role: "Restaurant Owner, Yaoundé",
            content: "As a business owner, I needed reliable waste collection. Klynaa delivers exactly what they promise.",
            rating: 5
        },
        {
            name: "Fatima Oumarou",
            role: "Environmental Worker",
            content: "Working with Klynaa has given me stable income while helping my community stay clean.",
            rating: 5
        }
    ];

    return (
        <>
            <Head>
                <title>Klynaa - Smart Waste Management for a Cleaner Cameroon</title>
                <meta name="description" content="Professional waste pickup services in Cameroon. Connect with verified workers for household, commercial, and recycling waste management. Creating jobs while protecting the environment." />
                <meta name="keywords" content="waste management Cameroon, garbage pickup Douala, recycling Yaoundé, waste collection, environmental services" />
                <meta property="og:title" content="Klynaa - Smart Waste Management for a Cleaner Cameroon" />
                <meta property="og:description" content="Professional waste pickup services connecting communities with verified workers across Cameroon." />
                <meta property="og:type" content="website" />
                <meta name="geo.region" content="CM" />
                <meta name="geo.placename" content="Cameroon" />
                <link rel="canonical" href="https://klynaa.com" />
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
                                    <Link href="/workers" className="text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
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
                                <Link href="/auth/register" className="btn-primary">
                                    Get Started
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
                                <span className="block">Smart Waste Management</span>
                                <span className="block text-green-600">for a Cleaner Cameroon</span>
                            </h1>
                            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                Connect with verified waste pickup workers in your area. Professional, reliable, and eco-friendly waste management that creates jobs and protects our environment.
                            </p>

                            {/* Search Bar */}
                            <div className="mt-8 max-w-2xl mx-auto">
                                <div className="bg-white rounded-lg shadow-lg p-4">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter your location (e.g., Douala, Yaoundé)"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                                                <option>Select service type</option>
                                                <option>Household Waste</option>
                                                <option>Commercial Waste</option>
                                                <option>Recycling</option>
                                                <option>Urgent Pickup</option>
                                            </select>
                                        </div>
                                        <button className="btn-primary px-8 py-3 whitespace-nowrap">
                                            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                                            Find Workers
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/auth/register?role=customer" className="btn-primary text-lg px-8 py-4">
                                    Book Pickup Service
                                </Link>
                                <Link href="/auth/register?role=worker" className="btn-secondary text-lg px-8 py-4">
                                    Become a Worker
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                How Klynaa Works
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Simple, efficient, and environmentally responsible waste management
                            </p>
                        </div>

                        <div className="mt-16">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {howItWorks.map((step, index) => (
                                    <div key={index} className="text-center">
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
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Our Services
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Comprehensive waste management solutions for every need
                            </p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {services.map((service, index) => (
                                <Link key={index} href={service.href} className="group">
                                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                                        <div className={`inline-flex items-center justify-center p-3 ${service.color} rounded-lg mb-4`}>
                                            <service.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-500">{service.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Link href="/services" className="btn-primary text-lg px-8 py-3">
                                View All Services
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Map & Locations */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Service Coverage
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                We're expanding across Cameroon's major cities
                            </p>
                        </div>

                        <div className="mt-16">
                            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPinIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map Coming Soon</h3>
                                    <p className="text-gray-500 mb-6">
                                        Currently serving Douala, Yaoundé, and expanding to more cities
                                    </p>
                                    <Link href="/locations" className="btn-primary">
                                        View Coverage Areas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials & Impact */}
                <section className="py-16 bg-green-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Community Impact
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Real stories from our community members
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">2,500+</div>
                                <div className="text-gray-500">Tons Recycled</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">150+</div>
                                <div className="text-gray-500">Jobs Created</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">50+</div>
                                <div className="text-gray-500">Communities Served</div>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-lg">★</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-gray-500 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="py-16 bg-green-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Ready to Make a Difference?
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto">
                            Join our community of environmentally conscious citizens and workers building a cleaner Cameroon.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/auth/register?role=customer" className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Book Your First Pickup
                            </Link>
                            <Link href="/auth/register?role=worker" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Start Earning Today
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
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-300 hover:text-white">
                                        <span className="sr-only">Facebook</span>
                                        📘
                                    </a>
                                    <a href="#" className="text-gray-300 hover:text-white">
                                        <span className="sr-only">Twitter</span>
                                        🐦
                                    </a>
                                    <a href="#" className="text-gray-300 hover:text-white">
                                        <span className="sr-only">Instagram</span>
                                        📷
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Services</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/services/household" className="text-gray-300 hover:text-white">Household Waste</Link></li>
                                    <li><Link href="/services/commercial" className="text-gray-300 hover:text-white">Commercial Waste</Link></li>
                                    <li><Link href="/services/recycling" className="text-gray-300 hover:text-white">Recycling</Link></li>
                                    <li><Link href="/services/urgent" className="text-gray-300 hover:text-white">Urgent Pickup</Link></li>
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
}
