import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    ArrowPathIcon,
    UserGroupIcon,
    GlobeAltIcon,
    HeartIcon,
    ChartBarIcon,
    TruckIcon,
    BuildingOfficeIcon,
    UsersIcon,
    StarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const About: React.FC = () => {
    const stats = [
        { label: "Waste Collected", value: "2,500+", unit: "tons", icon: TruckIcon },
        { label: "Active Workers", value: "1,200+", unit: "verified", icon: UserGroupIcon },
        { label: "Cities Served", value: "8", unit: "major cities", icon: BuildingOfficeIcon },
        { label: "Happy Customers", value: "15,000+", unit: "served", icon: UsersIcon }
    ];

    const team = [
        {
            name: "Emmanuel Tabi",
            role: "CEO & Co-Founder",
            bio: "Environmental engineer with 10+ years in waste management. Former UN Environment consultant.",
            avatar: "ET",
            linkedin: "#"
        },
        {
            name: "Marie Nguema",
            role: "CTO & Co-Founder",
            bio: "Tech entrepreneur passionate about sustainable solutions. Previously led engineering at major fintech.",
            avatar: "MN",
            linkedin: "#"
        },
        {
            name: "Paul Essomba",
            role: "Head of Operations",
            bio: "Operations expert with deep knowledge of Cameroon's logistics landscape.",
            avatar: "PE",
            linkedin: "#"
        },
        {
            name: "Aisha Bello",
            role: "Head of Sustainability",
            bio: "Environmental scientist focused on circular economy and community engagement.",
            avatar: "AB",
            linkedin: "#"
        }
    ];

    const values = [
        {
            title: "Environmental Impact",
            description: "We're committed to reducing waste and promoting sustainable practices across Cameroon.",
            icon: GlobeAltIcon,
            color: "bg-green-500"
        },
        {
            title: "Community First",
            description: "Creating economic opportunities while serving our communities with excellence.",
            icon: HeartIcon,
            color: "bg-red-500"
        },
        {
            title: "Innovation",
            description: "Leveraging technology to solve complex waste management challenges efficiently.",
            icon: ChartBarIcon,
            color: "bg-blue-500"
        },
        {
            title: "Reliability",
            description: "Consistent, dependable service that customers and workers can trust.",
            icon: CheckCircleIcon,
            color: "bg-purple-500"
        }
    ];

    const milestones = [
        {
            year: "2023",
            title: "Company Founded",
            description: "Klynaa launched in Douala with 5 pilot workers and 50 early customers."
        },
        {
            year: "2024",
            title: "Rapid Expansion",
            description: "Expanded to Yaoundé, Bamenda, and Bafoussam. Reached 500+ workers and 5,000+ customers."
        },
        {
            year: "2024",
            title: "Tech Innovation",
            description: "Launched mobile apps, AI-powered routing, and digital payment integration."
        },
        {
            year: "2025",
            title: "National Coverage",
            description: "Serving 8 major cities with 1,200+ workers and 15,000+ satisfied customers."
        }
    ];

    return (
        <>
            <Head>
                <title>About Klynaa - Smart Waste Management for Cameroon</title>
                <meta name="description" content="Learn about Klynaa's mission to revolutionize waste management in Cameroon through technology, community engagement, and environmental sustainability." />
                <meta name="keywords" content="waste management Cameroon, environmental sustainability, green technology, circular economy, Douala waste, Yaoundé recycling" />
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
                                    <Link href="/about" className="text-green-600 px-3 py-2 rounded-md text-sm font-medium">
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
                                <span className="block">Building a Cleaner</span>
                                <span className="block text-green-600">Future for Cameroon</span>
                            </h1>
                            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                Klynaa is revolutionizing waste management across Cameroon through innovative technology,
                                community engagement, and sustainable practices.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Our Impact in Numbers
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Making a real difference across Cameroon
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-lg mb-4">
                                        <stat.icon className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wide">{stat.unit}</div>
                                    <div className="text-lg font-medium text-gray-700 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Our Mission
                            </h2>
                            <p className="mt-4 max-w-4xl mx-auto text-xl text-gray-500">
                                To create a sustainable waste management ecosystem that benefits communities,
                                protects the environment, and provides economic opportunities for Cameroonians.
                            </p>
                        </div>

                        <div className="mt-16">
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Why We Started Klynaa</h3>
                                    <div className="space-y-4 text-gray-600">
                                        <p>
                                            Cameroon generates over 6 million tons of waste annually, with only 20% being properly managed.
                                            This creates environmental hazards, health risks, and missed economic opportunities.
                                        </p>
                                        <p>
                                            We founded Klynaa to bridge this gap by connecting communities with reliable waste collection
                                            services while creating meaningful employment for thousands of Cameroonians.
                                        </p>
                                        <p>
                                            Our technology-driven approach ensures efficiency, transparency, and accountability in
                                            every pickup, helping build trust between service providers and customers.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-green-100 rounded-lg p-8">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h4>
                                    <p className="text-gray-700 mb-6">
                                        To become Africa's leading smart waste management platform, setting the standard
                                        for environmental sustainability and community empowerment.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">50%</div>
                                            <div className="text-gray-600">Waste Reduction Goal</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">10,000+</div>
                                            <div className="text-gray-600">Jobs Created Target</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Our Values
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                The principles that guide everything we do
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {values.map((value, index) => (
                                <div key={index} className="text-center">
                                    <div className={`inline-flex items-center justify-center p-4 ${value.color} rounded-lg mb-4`}>
                                        <value.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                                    <p className="text-gray-500">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Our Journey
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Key milestones in building Cameroon's leading waste management platform
                            </p>
                        </div>

                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-600 text-white font-bold">
                                            {milestone.year.slice(-2)}
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <div className="text-lg font-semibold text-gray-900">{milestone.year} - {milestone.title}</div>
                                        <p className="text-gray-600 mt-1">{milestone.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Meet Our Team
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Passionate professionals dedicated to transforming waste management
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {team.map((member, index) => (
                                <div key={index} className="text-center">
                                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-green-600 text-xl font-bold">{member.avatar}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                                    <p className="text-green-600 font-medium mb-2">{member.role}</p>
                                    <p className="text-gray-500 text-sm">{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-green-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Join Our Mission
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto">
                            Whether you're a customer seeking reliable waste pickup or someone looking to earn income,
                            we'd love to have you as part of the Klynaa community.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/auth/register" className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Book a Pickup
                            </Link>
                            <Link href="/workers" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Become a Worker
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
                                    Smart waste management for a cleaner Cameroon. Building sustainable communities
                                    through innovative technology and environmental stewardship.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Company</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                                    <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
                                    <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                                    <li><Link href="/press" className="text-gray-300 hover:text-white">Press</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
                                    <li><Link href="/support" className="text-gray-300 hover:text-white">Support</Link></li>
                                    <li><Link href="/community" className="text-gray-300 hover:text-white">Community</Link></li>
                                    <li><Link href="/partners" className="text-gray-300 hover:text-white">Partners</Link></li>
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

export default About;
