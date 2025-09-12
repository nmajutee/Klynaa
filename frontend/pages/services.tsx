import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    HomeIcon,
    BuildingOfficeIcon,
    ArrowPathIcon,
    BoltIcon,
    ClockIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

const Services: React.FC = () => {
    const services = [
        {
            title: "Household Waste",
            description: "Regular pickup for residential waste and recycling",
            icon: HomeIcon,
            features: [
                "Weekly scheduled pickups",
                "Organic waste separation",
                "Recycling sorting",
                "Special item disposal"
            ],
            pricing: "From 15,000 XAF/month",
            href: "/services/household",
            color: "bg-klynaa-primary"
        },
        {
            title: "Commercial Waste",
            description: "Comprehensive waste management for businesses",
            icon: BuildingOfficeIcon,
            features: [
                "Daily pickup options",
                "Large volume handling",
                "Compliance documentation",
                "Customized schedules"
            ],
            pricing: "From 50,000 XAF/month",
            href: "/services/commercial",
            color: "bg-klynaa-secondary"
        },
        {
            title: "Recycling Services",
            description: "Eco-friendly recycling and waste transformation",
            icon: ArrowPathIcon,
            features: [
                "Material sorting",
                "Eco-friendly processing",
                "Environmental reports",
                "Carbon footprint tracking"
            ],
            pricing: "From 8,000 XAF/pickup",
            href: "/services/recycling",
            color: "bg-klynaa-primary"
        },
        {
            title: "Urgent Pickup",
            description: "Same-day and emergency waste collection",
            icon: BoltIcon,
            features: [
                "2-hour response time",
                "24/7 availability",
                "Emergency cleaning",
                "Immediate disposal"
            ],
            pricing: "From 25,000 XAF/pickup",
            href: "/services/urgent",
            color: "bg-orange-500"
        }
    ];

    const additionalServices = [
        {
            title: "Construction Waste",
            description: "Safe disposal of construction debris and materials",
            icon: BuildingOfficeIcon
        },
        {
            title: "Electronic Waste",
            description: "Proper disposal and recycling of electronic devices",
            icon: BoltIcon
        },
        {
            title: "Medical Waste",
            description: "Specialized handling of medical and hazardous waste",
            icon: CheckCircleIcon
        }
    ];

    return (
        <>
            <Head>
                <title>Our Services - Klynaa Waste Management</title>
                <meta name="description" content="Comprehensive waste management services in Cameroon. Household waste, commercial waste, recycling, and urgent pickup services." />
                <meta name="keywords" content="waste services Cameroon, household waste pickup, commercial waste, recycling services, urgent waste collection" />
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
                                    <Link href="/services" className="text-green-600 px-3 py-2 rounded-md text-sm font-medium">
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

                {/* Breadcrumbs */}
                <div className="bg-gray-50 py-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-4">
                                <li>
                                    <Link href="/" className="text-gray-500 hover:text-gray-700">
                                        Home
                                    </Link>
                                </li>
                                <li className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="ml-4 text-gray-700 font-medium">Services</span>
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* Hero Section */}
                <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                            Our Waste Management Services
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                            Professional, reliable, and eco-friendly waste management solutions for every need in Cameroon
                        </p>
                    </div>
                </section>

                {/* Main Services */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {services.map((service, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="p-8">
                                        <div className="flex items-center mb-6">
                                            <div className={`inline-flex items-center justify-center p-3 ${service.color} rounded-lg mr-4`}>
                                                <service.icon className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                                                <p className="text-gray-500">{service.description}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-3">What's Included:</h4>
                                            <ul className="space-y-2">
                                                {service.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-center">
                                                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                                        <span className="text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                                                <span className="text-lg font-semibold text-gray-900">{service.pricing}</span>
                                            </div>
                                            <Link href={service.href} className="btn-primary">
                                                Learn More
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Additional Services */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900">Specialized Services</h2>
                            <p className="mt-4 text-xl text-gray-500">
                                Additional waste management solutions for specific needs
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {additionalServices.map((service, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-lg mb-4">
                                        <service.icon className="h-8 w-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                                    <p className="text-gray-500">{service.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <p className="text-gray-600 mb-4">Need a custom solution?</p>
                            <Link href="/contact" className="btn-primary">
                                Contact Our Team
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Coverage Areas */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900">Service Coverage</h2>
                            <p className="mt-4 text-xl text-gray-500">
                                We currently serve major cities across Cameroon
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {['Douala', 'Yaoundé', 'Bamenda', 'Garoua'].map((city, index) => (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-lg mb-4">
                                        <MapPinIcon className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{city}</h3>
                                    <p className="text-gray-500">Full service coverage</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-green-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold text-white">
                            Ready to Get Started?
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto">
                            Choose the service that fits your needs and book your first pickup today.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/auth/register?role=customer" className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Book a Service
                            </Link>
                            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Get a Quote
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
};

export default Services;
