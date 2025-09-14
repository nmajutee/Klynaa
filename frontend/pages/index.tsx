import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useAuthStore } from '../stores';
import Button from '../components/ui/Button';
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
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightIcon,
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

    // Carousel state
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [activeStory, setActiveStory] = useState('douala');

    const handleLanguageChange = (language: string) => {
        setCurrentLanguage(language);
        // Here you would typically save to localStorage and trigger i18n
        localStorage.setItem('preferred-language', language);
        // TODO: Implement actual translation switching
    };

    // Mock providers for the coverage map - showing only FULL BINS ready for pickup
    const providers: CoverageProvider[] = [
        // Full Bins Only (Red pins - urgent pickup needed)
        {
            id: 'b1',
            name: 'Nmaju Terence',
            type: 'bin_owner',
            lat: 4.0511,
            lng: 9.7679,
            rating: 4.6,
            availability: 'available',
            distance: '1.2 km',
            services: ['Commercial Bin'],
            phone: '+237123456789',
            binStatus: 'full',
            fillLevel: 100,
            timesFull: '2h 15m',
            binType: 'commercial',
            ownerPhoto: '/api/placeholder/50/50',
            address: 'Douala Central Market'
        },
        {
            id: 'b2',
            name: 'Tang Chi',
            type: 'bin_owner',
            lat: 4.0615,
            lng: 9.7821,
            rating: 4.8,
            availability: 'available',
            distance: '2.1 km',
            services: ['Residential Bin'],
            phone: '+237123456790',
            binStatus: 'full',
            fillLevel: 95,
            timesFull: '4h 30m',
            binType: 'residential',
            ownerPhoto: '/api/placeholder/50/50',
            address: 'Akwa North Residential'
        },
        {
            id: 'b3',
            name: 'Marie Kenfack',
            type: 'bin_owner',
            lat: 4.042,
            lng: 9.751,
            rating: 4.3,
            availability: 'available',
            distance: '1.8 km',
            services: ['Recycling Bin'],
            phone: '+237123456791',
            binStatus: 'full',
            fillLevel: 100,
            timesFull: '1h 45m',
            binType: 'recycling',
            ownerPhoto: '/api/placeholder/50/50',
            address: 'Bonanjo Business District'
        },
        {
            id: 'b4',
            name: 'Sarah Miller',
            type: 'bin_owner',
            lat: 4.065,
            lng: 9.735,
            rating: 4.7,
            availability: 'available',
            distance: '3.1 km',
            services: ['Commercial Bin'],
            phone: '+237123456792',
            binStatus: 'full',
            fillLevel: 90,
            timesFull: '6h 10m',
            binType: 'commercial',
            ownerPhoto: '/api/placeholder/50/50',
            address: 'New Bell Commercial Area'
        },
        {
            id: 'b5',
            name: 'Jean Baptiste',
            type: 'bin_owner',
            lat: 4.058,
            lng: 9.762,
            rating: 4.5,
            availability: 'available',
            distance: '2.8 km',
            services: ['Residential Bin'],
            phone: '+237123456793',
            binStatus: 'full',
            fillLevel: 100,
            timesFull: '3h 20m',
            binType: 'residential',
            ownerPhoto: '/api/placeholder/50/50',
            address: 'Bonapriso Residential'
        }
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

    // Carousel configuration
    const cardsPerView = {
        desktop: 3,
        tablet: 2,
        mobile: 1
    };

    const services = [
        {
            title: "Household Waste Pickup",
            description: "Schedule fast and reliable waste pickups right from your home. Eco-friendly disposal guaranteed.",
            icon: HomeIcon,
            href: "/services/household",
            color: "bg-klynaa-primary"
        },
        {
            title: "Commercial Waste Management",
            description: "Tailored solutions for offices, shops, and markets. Keep your business clean and compliant.",
            icon: BuildingOfficeIcon,
            href: "/services/commercial",
            color: "bg-blue-500"
        },
        {
            title: "Recycling Services",
            description: "Turn your recyclable waste into new opportunities. Helping the community and environment.",
            icon: ArrowPathIcon,
            href: "/services/recycling",
            color: "bg-klynaa-primary"
        },
        {
            title: "Urgent Waste Pickup",
            description: "Need immediate cleanup? Book a rapid-response pickup in minutes.",
            icon: BoltIcon,
            href: "/services/urgent",
            color: "bg-orange-500"
        },
        {
            title: "Waste-to-Energy",
            description: "Converting waste into renewable energy sources to power local communities.",
            icon: SparklesIcon,
            href: "/services/energy",
            color: "bg-purple-500"
        },
        {
            title: "Bulk Waste Removal",
            description: "Large item disposal and construction waste management for homes and businesses.",
            icon: TruckIcon,
            href: "/services/bulk",
            color: "bg-indigo-500"
        }
    ];

    // Auto-advance carousel
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % Math.ceil(services.length / cardsPerView.desktop));
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, services.length, cardsPerView.desktop]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(services.length / cardsPerView.desktop));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + Math.ceil(services.length / cardsPerView.desktop)) % Math.ceil(services.length / cardsPerView.desktop));
    };

    const handleStoryClick = (storyId: string) => {
        setActiveStory(storyId);
    };

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

                {/* Our Services Section */}
                <section className="our-services-section py-16 bg-gray-50">
                    <div className="our-services-container">
                        <div className="our-services-header">
                            <h2 className="our-services-title">Our Services</h2>
                            <p className="our-services-subtitle">
                                Comprehensive waste management solutions tailored to meet your needs.
                                From household pickups to commercial waste management, we've got you covered.
                            </p>
                        </div>

                        <div className="services-carousel-wrapper"
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={() => setIsAutoPlaying(true)}>

                            {/* Navigation Controls */}
                            <button
                                onClick={prevSlide}
                                className="carousel-nav carousel-nav-prev"
                                aria-label="Previous services"
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>

                            <button
                                onClick={nextSlide}
                                className="carousel-nav carousel-nav-next"
                                aria-label="Next services"
                            >
                                <ChevronRightIcon className="w-6 h-6" />
                            </button>

                            {/* Carousel Track */}
                            <div className="services-carousel">
                                <div className="services-carousel-track">
                                    <div className="services-carousel-container"
                                        style={{ transform: `translateX(-${currentSlide * 50}%)` }}>
                                        {services.map((service, index) => {
                                            const IconComponent = service.icon;
                                            return (
                                                <div key={index} className="service-card-wrapper">
                                                    <div className="service-card">
                                                        <div className="service-card-content">
                                                            <div className={`service-icon ${service.color}`}>
                                                                <IconComponent className="service-icon-svg" />
                                                            </div>
                                                            <div className="service-content">
                                                                <h3 className="service-title">{service.title}</h3>
                                                                <p className="service-description">{service.description}</p>
                                                            </div>
                                                            <a href={service.href} className="service-cta">
                                                                <span className="service-cta-text">Learn More</span>
                                                                <ArrowRightIcon className="service-cta-icon w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Slide Indicators */}
                            <div className="carousel-dots">
                                {Array.from({ length: Math.ceil(services.length / cardsPerView.desktop) }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="our-services-cta">
                            <Link href="/services" className="btn-primary btn-lg">
                                View All Services
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Service Coverage Area Section */}
                <section className="service-coverage-section">
                    <div className="service-coverage-container">
                        {/* Header */}
                        <div className="service-coverage-header">
                            <h2 className="service-coverage-title">Full Bins Ready for Pickup</h2>
                            <p className="service-coverage-subtitle">
                                Real-time map showing bins that are full and ready for immediate pickup.
                                Help keep our communities clean by connecting with verified workers in your area.
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
                    </div>
                </section>

                {/* Community Impact Dashboard */}
                <section className="impact-dashboard-section">
                    <div className="impact-dashboard-container">
                        {/* Header */}
                        <div className="impact-dashboard-header">
                            <h2 className="impact-dashboard-title">Making a Real Difference</h2>
                            <p className="impact-dashboard-subtitle">
                                Every pickup, every recycled item, every job created contributes to a cleaner, more sustainable Cameroon
                            </p>
                        </div>

                        {/* Main Impact Display */}
                        <div className="impact-hero-metric">
                            <div className="hero-metric-content">
                                <div className="hero-metric-number">2,547</div>
                                <div className="hero-metric-label">Lives Positively Impacted</div>
                                <div className="hero-metric-description">
                                    Through job creation, cleaner neighborhoods, and environmental education
                                </div>
                            </div>
                            <div className="hero-metric-visual">
                                <div className="metric-circle">
                                    <div className="metric-circle-progress"></div>
                                    <div className="metric-circle-center">
                                        <SparklesIcon className="w-12 h-12 text-klynaa-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Metrics Grid */}
                        <div className="secondary-metrics-grid">
                            <div className="secondary-metric">
                                <div className="secondary-metric-icon">
                                    <ArrowPathIcon className="w-6 h-6" />
                                </div>
                                <div className="secondary-metric-content">
                                    <div className="secondary-metric-number">2,500+</div>
                                    <div className="secondary-metric-label">Tons Recycled</div>
                                </div>
                                <div className="secondary-metric-bar">
                                    <div className="metric-bar-fill" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div className="secondary-metric">
                                <div className="secondary-metric-icon">
                                    <UserGroupIcon className="w-6 h-6" />
                                </div>
                                <div className="secondary-metric-content">
                                    <div className="secondary-metric-number">150+</div>
                                    <div className="secondary-metric-label">Jobs Created</div>
                                </div>
                                <div className="secondary-metric-bar">
                                    <div className="metric-bar-fill" style={{ width: '70%' }}></div>
                                </div>
                            </div>

                            <div className="secondary-metric">
                                <div className="secondary-metric-icon">
                                    <HomeIcon className="w-6 h-6" />
                                </div>
                                <div className="secondary-metric-content">
                                    <div className="secondary-metric-number">8,900+</div>
                                    <div className="secondary-metric-label">Households Served</div>
                                </div>
                                <div className="secondary-metric-bar">
                                    <div className="metric-bar-fill" style={{ width: '92%' }}></div>
                                </div>
                            </div>

                            <div className="secondary-metric">
                                <div className="secondary-metric-icon">
                                    <MapPinIcon className="w-6 h-6" />
                                </div>
                                <div className="secondary-metric-content">
                                    <div className="secondary-metric-number">47</div>
                                    <div className="secondary-metric-label">Neighborhoods</div>
                                </div>
                                <div className="secondary-metric-bar">
                                    <div className="metric-bar-fill" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Success Story */}
                        <div className="featured-story">
                            <div className="featured-story-content">
                                <div className="featured-story-header">
                                    <h3 className="featured-story-title">This Month's Success Story</h3>
                                    <span className="featured-story-location">Douala Central Market</span>
                                </div>

                                <div className="featured-story-body">
                                    <div className="featured-story-text">
                                        <blockquote className="featured-quote">
                                            "Since Klynaa started managing our market waste, business has improved dramatically.
                                            The cleaner environment attracts more customers, and our vendors feel proud of their workspace."
                                        </blockquote>
                                        <div className="featured-author">
                                            <div className="author-info">
                                                <div className="author-name">Marie Ngozi</div>
                                                <div className="author-role">Market Vendor & Community Leader</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="featured-story-metrics">
                                        <div className="story-mini-metric">
                                            <span className="mini-metric-number">300+</span>
                                            <span className="mini-metric-label">Vendors</span>
                                        </div>
                                        <div className="story-mini-metric">
                                            <span className="mini-metric-number">80%</span>
                                            <span className="mini-metric-label">Cleaner</span>
                                        </div>
                                        <div className="story-mini-metric">
                                            <span className="mini-metric-number">15</span>
                                            <span className="mini-metric-label">Jobs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="featured-story-visual">
                                <div className="story-image-container">
                                    <Image
                                        src="/api/placeholder/400/300"
                                        alt="Douala Market Transformation"
                                        width={400}
                                        height={300}
                                        className="story-image"
                                    />
                                    <div className="story-image-overlay">
                                        <div className="overlay-badge">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span>Transformed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Environmental Impact Summary */}
                        <div className="environmental-impact">
                            <h3 className="environmental-title">Environmental Impact</h3>
                            <div className="environmental-grid">
                                <div className="environmental-item">
                                    <div className="environmental-icon">🌱</div>
                                    <div className="environmental-text">
                                        <div className="environmental-number">450 tons</div>
                                        <div className="environmental-label">CO₂ Emissions Prevented</div>
                                    </div>
                                </div>

                                <div className="environmental-item">
                                    <div className="environmental-icon">🌳</div>
                                    <div className="environmental-text">
                                        <div className="environmental-number">1,200</div>
                                        <div className="environmental-label">Trees Worth of Impact</div>
                                    </div>
                                </div>

                                <div className="environmental-item">
                                    <div className="environmental-icon">💧</div>
                                    <div className="environmental-text">
                                        <div className="environmental-number">85%</div>
                                        <div className="environmental-label">Reduction in Water Pollution</div>
                                    </div>
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

                {/* Join Our Growing Network CTA */}
                <section className="py-16 bg-klynaa-darkgreen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl klynaa-heading text-white sm:text-4xl">
                            Join Our Growing Network
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-2xl mx-auto klynaa-body">
                            Whether you're a waste management professional or a bin owner, become part of our community building a cleaner Cameroon.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/auth/register?role=worker" className="bg-white text-klynaa-darkgreen hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center klynaa-btn-secondary">
                                <Briefcase className="w-5 h-5 mr-2" />
                                Become a Worker
                            </Link>
                            <Link href="/auth/register?role=customer" className="bg-klynaa-primary text-white hover:bg-klynaa-dark font-semibold py-3 px-8 rounded-lg transition-colors border-2 border-white flex items-center justify-center klynaa-btn-primary">
                                <UserPlus className="w-5 h-5 mr-2" />
                                Register Your Bin
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
                                    <ArrowPathIcon className="h-8 w-8 text-klynaa-primary mr-2" />
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
