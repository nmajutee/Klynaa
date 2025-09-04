import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthStore } from '../stores';
import { Button } from '../components/ui/buttons';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
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
    BoltIcon,
    Bars3Icon,
    XMarkIcon,
    MapIcon,
    UserIcon,
    StarIcon,
    BuildingStorefrontIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
    Search,
    CalendarClock,
    Briefcase,
    Rocket,
    LogIn,
    UserPlus,
    MessageCircle,
    CreditCard,
    ArrowRightCircle
} from 'lucide-react';
import ServiceCoverageMap, { ServiceProvider as CoverageProvider } from '../components/ui/ServiceCoverageMap';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('en');

    const handleLanguageChange = (language: string) => {
        setCurrentLanguage(language);
        // Here you would typically save to localStorage and trigger i18n
        localStorage.setItem('preferred-language', language);
        // TODO: Implement actual translation switching
    };

    // Mock providers for the coverage map
    const providers: CoverageProvider[] = [
        // Bin Owners (Green)
        { id: 'o1', name: 'Nmaju Terence', type: 'bin_owner', lat: 4.0511, lng: 9.7679, rating: 4.6, availability: 'available', distance: '1.2 km', services: ['Business Bin'], phone: '+237123456789' },
        { id: 'o2', name: 'Tang Chi', type: 'bin_owner', lat: 4.0615, lng: 9.7821, rating: 4.8, availability: 'available', distance: '2.1 km', services: ['Business Bin'], phone: '+237123456790' },
        { id: 'o3', name: 'Ngang Edwin', type: 'bin_owner', lat: 4.042, lng: 9.751, rating: 4.3, availability: 'busy', distance: '1.8 km', services: ['Residential Bin'] },
        { id: 'o4', name: 'Sarah Miller', type: 'bin_owner', lat: 4.065, lng: 9.735, rating: 4.7, availability: 'available', distance: '3.1 km', services: ['Residential Bin'], phone: '+237123456791' },
        // Workers (Blue)
        { id: 'w1', name: 'Tarh Joshua', type: 'worker', lat: 4.072, lng: 9.773, rating: 4.7, availability: 'available', distance: '2.3 km', services: ['Bins Emptied: 230'], phone: '+237123456792' },
        { id: 'w2', name: 'Chi Che', type: 'worker', lat: 4.045, lng: 9.745, rating: 4.9, availability: 'available', distance: '1.5 km', services: ['Bins Emptied: 310'], phone: '+237123456793' },
        { id: 'w3', name: 'Frida Ayuk', type: 'worker', lat: 4.058, lng: 9.762, rating: 4.5, availability: 'available', distance: '2.8 km', services: ['Bins Emptied: 190'], phone: '+237123456794' },
        { id: 'w4', name: 'Ada N.', type: 'worker', lat: 4.035, lng: 9.785, rating: 4.8, availability: 'offline', distance: '4.0 km', services: ['Bins Emptied: 275'] },
    ];

    useEffect(() => {
        // Redirect authenticated users to dashboard
        if (isAuthenticated && user) {
            router.push('/dashboard');
        }

        // Handle navbar scroll effect
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Handle map pin interactions
        const handleMapPinClick = (event: Event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('map-pin')) {
                // Hide all popups first
                document.querySelectorAll('.map-popup').forEach(popup => {
                    popup.classList.remove('active');
                });

                // Show the corresponding popup
                const popupId = target.getAttribute('data-popup');
                if (popupId) {
                    const popup = document.getElementById(`popup-${popupId}`);
                    if (popup) {
                        popup.classList.add('active');

                        // Position popup relative to pin
                        const pinRect = target.getBoundingClientRect();
                        const mapRect = target.parentElement?.getBoundingClientRect();
                        if (mapRect) {
                            const left = pinRect.left - mapRect.left - 140; // Center popup on pin
                            const top = pinRect.top - mapRect.top - popup.offsetHeight - 10; // Above pin

                            popup.style.left = `${Math.max(10, Math.min(left, mapRect.width - popup.offsetWidth - 10))}px`;
                            popup.style.top = `${Math.max(10, top)}px`;
                        }
                    }
                }
            }
        };

        // Handle clicking outside to close popups
        const handleClickOutside = (event: Event) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.map-pin') && !target.closest('.map-popup')) {
                document.querySelectorAll('.map-popup').forEach(popup => {
                    popup.classList.remove('active');
                });
            }
        };

        document.addEventListener('click', handleMapPinClick);
        document.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleMapPinClick);
            document.removeEventListener('click', handleClickOutside);
        };
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
            description: "Book a waste pickup service in your area using our smart location system",
            icon: PhoneIcon
        },
        {
            step: "2",
            title: "Worker Accepts",
            description: "Verified workers near you accept your request within minutes",
            icon: UserGroupIcon
        },
        {
            step: "3",
            title: "Waste Collected",
            description: "Professional pickup, sorting, and eco-friendly disposal",
            icon: TruckIcon
        },
        {
            step: "4",
            title: "Track Impact",
            description: "See your environmental contribution and community impact",
            icon: SparklesIcon
        }
    ];

    const testimonials = [
        {
            name: "Marie Ngono",
            role: "Homeowner, Douala",
            content:
                "Klynaa has transformed how we handle waste in our neighborhood. The workers are professional and the app makes everything so simple.",
            rating: 5,
        },
        {
            name: "Eric N.",
            role: "Business Owner, Yaoundé",
            content:
                "Scheduling pickups is effortless and reliable. Our storefront stays clean and compliant.",
            rating: 5,
        },
        {
            name: "Fatima T.",
            role: "Community Leader, Buea",
            content:
                "The platform brings jobs to our area and keeps our streets cleaner. Amazing impact!",
            rating: 4,
        },
    ];

    return (
        <>
            <Head>
                <title>Klynaa - Smart Waste Management for Cameroon</title>
                <meta name="description" content="Connect with verified waste pickup workers in your area. Professional, reliable, and eco-friendly waste management that creates jobs and protects our environment." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-white">
                {/* Enhanced Navigation */}
                <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
                    <div className="navbar-container">
                        <div className="navbar-content">
                            {/* Brand */}
                            <Link href="/" className="navbar-brand">
                                <ArrowPathIcon className="navbar-brand-icon" />
                                <span>Klynaa</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="navbar-links">
                                <Link href="/services" className="navbar-link">Services</Link>
                                <Link href="/locations" className="navbar-link">Locations</Link>
                                <Link href="/workers" className="navbar-link">For Workers</Link>
                                <Link href="/about" className="navbar-link">About</Link>
                                <Link href="/blog" className="navbar-link">Blog</Link>
                            </div>

                            {/* Actions */}
                            <div className="navbar-actions">
                                <Link href="/auth/login" className="navbar-auth">
                                    Sign In
                                </Link>
                                <Link href="/book-pickup" className="btn btn-primary btn-sm">
                                    <CalendarClock size={16} className="mr-1" />
                                    Book Pickup Service
                                </Link>
                                <LanguageSwitcher
                                    currentLanguage={currentLanguage}
                                    onLanguageChange={handleLanguageChange}
                                />

                                {/* Mobile Menu Button */}
                                <button
                                    className="mobile-menu-button"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    aria-label="Toggle mobile menu"
                                >
                                    {mobileMenuOpen ? (
                                        <XMarkIcon className="h-6 w-6" />
                                    ) : (
                                        <Bars3Icon className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                            <div className="mobile-menu-links">
                                <Link href="/services" className="mobile-menu-link">Services</Link>
                                <Link href="/locations" className="mobile-menu-link">Locations</Link>
                                <Link href="/workers" className="mobile-menu-link">For Workers</Link>
                                <Link href="/about" className="mobile-menu-link">About</Link>
                                <Link href="/blog" className="mobile-menu-link">Blog</Link>
                            </div>
                            <LanguageSwitcher
                                currentLanguage={currentLanguage}
                                onLanguageChange={handleLanguageChange}
                                isMobile={true}
                            />
                            <div className="mobile-menu-actions">
                                <Link href="/book-pickup" className="btn btn-primary">
                                    <CalendarClock size={16} className="mr-2" />
                                    Book Pickup Service
                                </Link>
                                <Link href="/auth/login" className="btn btn-ghost">Sign In</Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Enhanced Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-container">
                            <h1 className="hero-title">
                                <span className="block">Smart Waste Management</span>
                                <span className="block" style={{ color: 'var(--color-primary)' }}>for a Cleaner Cameroon</span>
                            </h1>

                            <p className="hero-subtitle">
                                Connect with verified waste pickup workers in your area. Professional, reliable,
                                and eco-friendly waste management that creates jobs and protects our environment.
                            </p>

                            {/* Enhanced Search Component */}
                            <div className="hero-search">
                                <div className="search-container">
                                    <form className="search-form" role="search" aria-label="Find waste pickup workers">
                                        <div className="search-input-group">
                                            <MapPinIcon className="search-input-icon" aria-hidden="true" />
                                            <input
                                                type="text"
                                                placeholder="Enter your location (e.g., Douala, Yaoundé)"
                                                className="search-input"
                                                aria-label="Enter your location"
                                                required
                                            />
                                        </div>

                                        <div className="search-select-wrapper">
                                            <select
                                                className="search-select"
                                                aria-label="Select service type"
                                                required
                                            >
                                                <option value="">Select service type</option>
                                                <option value="household">Household Waste</option>
                                                <option value="commercial">Commercial Waste</option>
                                                <option value="recycling">Recycling</option>
                                                <option value="urgent">Urgent Pickup</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            className="search-button"
                                            aria-label="Find waste pickup workers"
                                        >
                                            <Search size={20} className="search-button-icon" aria-hidden="true" />
                                            Find Workers
                                        </button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Enhanced How It Works Section */}
                <section className="how-it-works-section">
                    <div className="how-it-works-container">
                        <div className="how-it-works-header">
                            <h2 className="how-it-works-title">
                                How Klynaa Works
                            </h2>
                            <p className="how-it-works-subtitle">
                                Simple, efficient, and environmentally responsible waste management in 4 easy steps
                            </p>
                        </div>

                        <div className="how-it-works-grid">
                            {howItWorks.map((step, index) => (
                                <div key={index} className="how-it-works-card">
                                    <div className="how-it-works-icon-container">
                                        <step.icon
                                            className="how-it-works-icon"
                                            aria-label={`Step ${step.step} icon`}
                                        />
                                        <span
                                            className="how-it-works-step-badge"
                                            aria-label={`Step ${step.step}`}
                                        >
                                            {step.step}
                                        </span>
                                    </div>
                                    <h3 className="how-it-works-step-title">
                                        {step.title}
                                    </h3>
                                    <p className="how-it-works-step-description">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Service Coverage Area Section */}
                <section className="service-coverage-section">
                    <div className="service-coverage-container">
                        {/* Header */}
                        <div className="service-coverage-header">
                            <h2 className="service-coverage-title">Service Coverage Area</h2>
                            <p className="service-coverage-subtitle">
                                Discover our growing network of waste management professionals and bin owners
                                across your city. Join thousands of users already making waste management smarter.
                            </p>
                        </div>

                        {/* Interactive Map */}
                        <div className="service-coverage-map-container">
                            <ServiceCoverageMap
                                providers={providers}
                                height="500px"
                                center={[4.0511, 9.7679]} // Douala, Cameroon coordinates
                                zoom={11}
                                onProviderSelect={(provider) => console.log('Selected provider:', provider)}
                            />
                        </div>

                        {/* Coverage Statistics */}
                        <div className="service-coverage-stats">
                            <div className="coverage-stat-card">
                                <UserGroupIcon className="coverage-stat-icon" />
                                <div className="coverage-stat-number">2,547</div>
                                <div className="coverage-stat-label">Active Workers</div>
                            </div>
                            <div className="coverage-stat-card">
                                <HomeIcon className="coverage-stat-icon" />
                                <div className="coverage-stat-number">8,932</div>
                                <div className="coverage-stat-label">Registered Bins</div>
                            </div>
                            <div className="coverage-stat-card">
                                <MapPinIcon className="coverage-stat-icon" />
                                <div className="coverage-stat-number">47</div>
                                <div className="coverage-stat-label">Neighborhoods</div>
                            </div>
                        </div>

                        {/* Join Network CTA */}
                        <div className="join-network-cta">
                            <h3 className="join-network-title">Join Our Growing Network</h3>
                            <p className="join-network-description">
                                Whether you're a waste management professional or a bin owner,
                                join our platform to connect with your local community.
                            </p>
                            <div className="join-network-buttons">
                                <button className="btn btn-primary btn-sm">
                                    <Briefcase size={16} className="mr-1" />
                                    Become a Worker
                                </button>
                                <button className="btn btn-secondary btn-sm">
                                    <UserPlus size={16} className="mr-1" />
                                    Register Your Bin
                                </button>
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
