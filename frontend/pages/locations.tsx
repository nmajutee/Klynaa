import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    ArrowPathIcon,
    MapPinIcon,
    ClockIcon,
    TruckIcon,
    PhoneIcon,
    UsersIcon,
    CheckCircleIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const Locations: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState('douala');

    const cities = [
        {
            id: 'douala',
            name: 'Douala',
            region: 'Littoral',
            population: '3.2M',
            workers: 450,
            coverage: '95%',
            responseTime: '30 mins',
            phone: '+237 233 42 XX XX',
            areas: [
                'Akwa', 'Bonanjo', 'New Bell', 'Deido', 'Bonapriso', 'Logbaba',
                'Makepe', 'Kotto', 'Bepanda', 'Nylon', 'Cite SIC', 'PK8',
                'Ndogpassi', 'Ndokotti', 'Village', 'Bonaberi'
            ],
            description: 'Our flagship location with the most comprehensive coverage and fastest response times.',
            coordinates: { lat: 4.0511, lng: 9.7679 }
        },
        {
            id: 'yaounde',
            name: 'Yaoundé',
            region: 'Centre',
            population: '2.8M',
            workers: 380,
            coverage: '90%',
            responseTime: '35 mins',
            phone: '+237 222 23 XX XX',
            areas: [
                'Centre-ville', 'Bastos', 'Nlongkak', 'Mvan', 'Elig-Edzoa',
                'Nkomo', 'Emana', 'Ekounou', 'Essos', 'Mfandena', 'Odza',
                'Ngousso', 'Kondengui', 'Mvog-Mbi', 'Tsinga', 'Madagascar'
            ],
            description: 'Comprehensive waste management services for the capital city.',
            coordinates: { lat: 3.8480, lng: 11.5021 }
        },
        {
            id: 'bamenda',
            name: 'Bamenda',
            region: 'Northwest',
            population: '800K',
            workers: 120,
            coverage: '85%',
            responseTime: '45 mins',
            phone: '+237 233 36 XX XX',
            areas: [
                'Commercial Avenue', 'Cow Street', 'Mile 1', 'Mile 2', 'Mile 3',
                'Ntarikon', 'Nkwen', 'Mankon', 'Mulang', 'Old Town', 'Up Station'
            ],
            description: 'Serving the beautiful highland city with eco-friendly waste solutions.',
            coordinates: { lat: 5.9597, lng: 10.1463 }
        },
        {
            id: 'bafoussam',
            name: 'Bafoussam',
            region: 'West',
            population: '600K',
            workers: 95,
            coverage: '80%',
            responseTime: '40 mins',
            phone: '+237 233 44 XX XX',
            areas: [
                'Centre-ville', 'Djeleng', 'Tamdja', 'Famla', 'Tougang',
                'Koptchou', 'Hindé', 'Kamkop', 'Ndiangdam'
            ],
            description: 'Growing our presence in the western highlands.',
            coordinates: { lat: 5.4737, lng: 10.4174 }
        },
        {
            id: 'garoua',
            name: 'Garoua',
            region: 'North',
            population: '450K',
            workers: 75,
            coverage: '75%',
            responseTime: '50 mins',
            phone: '+237 222 27 XX XX',
            areas: [
                'Centre-ville', 'Doualaré', 'Ribadou', 'Ouro Tchédé',
                'Kollere', 'Baschéo', 'Yelwa'
            ],
            description: 'Expanding eco-friendly waste management to northern Cameroon.',
            coordinates: { lat: 9.3265, lng: 13.3844 }
        },
        {
            id: 'buea',
            name: 'Buea',
            region: 'Southwest',
            population: '300K',
            workers: 60,
            coverage: '70%',
            responseTime: '45 mins',
            phone: '+237 233 32 XX XX',
            areas: [
                'Buea Town', 'Molyko', 'Great Soppo', 'Bonduma',
                'Mile 16', 'Bokwango', 'Clerks Quarters'
            ],
            description: 'Protecting the beautiful slopes of Mount Cameroon.',
            coordinates: { lat: 4.1560, lng: 9.2041 }
        },
        {
            id: 'bertoua',
            name: 'Bertoua',
            region: 'East',
            population: '250K',
            workers: 40,
            coverage: '65%',
            responseTime: '55 mins',
            phone: '+237 222 24 XX XX',
            areas: [
                'Centre-ville', 'Mokolo', 'Sabongari', 'Quartier Administratif'
            ],
            description: 'Bringing modern waste management to eastern Cameroon.',
            coordinates: { lat: 4.5767, lng: 13.6833 }
        },
        {
            id: 'ngaoundere',
            name: 'Ngaoundéré',
            region: 'Adamawa',
            population: '200K',
            workers: 35,
            coverage: '60%',
            responseTime: '60 mins',
            phone: '+237 222 25 XX XX',
            areas: [
                'Centre-ville', 'Petit Marché', 'Gare', 'Dang'
            ],
            description: 'High-altitude waste management solutions.',
            coordinates: { lat: 7.3167, lng: 13.5833 }
        }
    ];

    const selectedCityData = cities.find(city => city.id === selectedCity) || cities[0];

    const serviceHours = [
        { day: 'Monday - Friday', hours: '6:00 AM - 8:00 PM' },
        { day: 'Saturday', hours: '7:00 AM - 6:00 PM' },
        { day: 'Sunday', hours: '8:00 AM - 4:00 PM' },
        { day: 'Public Holidays', hours: 'Emergency only' }
    ];

    return (
        <>
            <Head>
                <title>Klynaa Locations - Waste Management Across Cameroon</title>
                <meta name="description" content="Klynaa serves 8 major cities across Cameroon with reliable waste pickup services. Find coverage areas, response times, and contact info for your location." />
                <meta name="keywords" content="waste pickup Douala, Yaoundé garbage collection, Bamenda waste service, Cameroon cities waste management" />
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
                                    <Link href="/locations" className="text-green-600 px-3 py-2 rounded-md text-sm font-medium">
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            <span className="block">Serving</span>
                            <span className="block text-green-600">8 Major Cities</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            From Douala to Ngaoundéré, Klynaa provides reliable waste management services
                            across Cameroon with local teams and 24/7 support.
                        </p>
                    </div>
                </section>

                {/* City Selector */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Choose Your City
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                Select your location to see coverage areas and local information
                            </p>
                        </div>

                        {/* City Cards Grid */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
                            {cities.map((city) => (
                                <div
                                    key={city.id}
                                    onClick={() => setSelectedCity(city.id)}
                                    className={`cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-lg ${selectedCity === city.id
                                            ? 'border-green-500 bg-green-50 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-green-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{city.name}</h3>
                                        {selectedCity === city.id && (
                                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                        )}
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Population:</span>
                                            <span className="font-medium">{city.population}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Workers:</span>
                                            <span className="font-medium">{city.workers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Coverage:</span>
                                            <span className="font-medium text-green-600">{city.coverage}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selected City Details */}
                        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* City Info */}
                                <div>
                                    <div className="flex items-center mb-6">
                                        <MapPinIcon className="h-8 w-8 text-green-600 mr-3" />
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{selectedCityData.name}</h3>
                                            <p className="text-gray-500">{selectedCityData.region} Region</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mb-6">{selectedCityData.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center mb-2">
                                                <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
                                                <span className="text-sm text-gray-600">Active Workers</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{selectedCityData.workers}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center mb-2">
                                                <ClockIcon className="h-5 w-5 text-green-500 mr-2" />
                                                <span className="text-sm text-gray-600">Response Time</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{selectedCityData.responseTime}</div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center mb-2">
                                            <PhoneIcon className="h-5 w-5 text-purple-500 mr-2" />
                                            <span className="text-sm text-gray-600">Local Support</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">{selectedCityData.phone}</div>
                                    </div>

                                    <Link href={`/auth/register?city=${selectedCityData.id}`} className="btn-primary w-full">
                                        Book Pickup in {selectedCityData.name}
                                    </Link>
                                </div>

                                {/* Coverage Areas */}
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Coverage Areas</h4>
                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        {selectedCityData.areas.map((area, index) => (
                                            <div key={index} className="bg-green-50 text-green-800 px-3 py-2 rounded-md text-sm font-medium">
                                                {area}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-900 mb-2">Service Hours</h5>
                                        <div className="space-y-1">
                                            {serviceHours.map((schedule, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{schedule.day}</span>
                                                    <span className="font-medium text-gray-900">{schedule.hours}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Coverage Map Placeholder */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Interactive Coverage Map
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                See exactly where we operate in your city
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                                <div className="text-center">
                                    <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Interactive Map Coming Soon</p>
                                    <p className="text-gray-400">See real-time coverage and worker locations</p>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                Our interactive map will show you real-time worker locations, coverage areas,
                                and estimated pickup times for your specific address.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-green-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Ready to Get Started?
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto">
                            Join thousands of satisfied customers across Cameroon.
                            Quick, reliable, and eco-friendly waste pickup.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/auth/register" className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                                Schedule Pickup
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
                                    Smart waste management across Cameroon. Local teams, nationwide coverage,
                                    and a commitment to environmental sustainability.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/services" className="text-gray-300 hover:text-white">Services</Link></li>
                                    <li><Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                                    <li><Link href="/coverage" className="text-gray-300 hover:text-white">Coverage Map</Link></li>
                                    <li><Link href="/support" className="text-gray-300 hover:text-white">Support</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                                <ul className="space-y-2">
                                    <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
                                    <li><Link href="/emergency" className="text-gray-300 hover:text-white">Emergency Service</Link></li>
                                    <li><Link href="/feedback" className="text-gray-300 hover:text-white">Feedback</Link></li>
                                    <li><Link href="/partnerships" className="text-gray-300 hover:text-white">Partnerships</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                            <p className="text-gray-300">
                                &copy; 2025 Klynaa. All rights reserved. Serving Cameroon with pride.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Locations;
