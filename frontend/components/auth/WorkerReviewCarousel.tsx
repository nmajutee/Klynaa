import React from 'react';

// Sample worker reviews data (will be replaced with API data later)
const workerReviews = [
    {
        id: 1,
        worker_name: "Paul Biya Jr.",
        role: "Top Worker in Douala",
        review: "Working with Klynaa has given me financial independence. Professional, reliable and always on time!",
        avatar_url: null, // Will use initials
        rating: 5,
        created_at: "2024-09-01"
    },
    {
        id: 2,
        worker_name: "Aisha Mbangue",
        role: "Premium Worker in Yaoundé",
        review: "Excellent service delivery and eco-friendly waste management. Highly recommended professional!",
        avatar_url: null,
        rating: 5,
        created_at: "2024-08-28"
    },
    {
        id: 3,
        worker_name: "Jean-Claude Kamdem",
        role: "Top Rated in Bamenda",
        review: "Outstanding commitment to environmental protection and community service. Always professional.",
        avatar_url: null,
        rating: 5,
        created_at: "2024-08-25"
    },
    {
        id: 4,
        worker_name: "Marie Dupont",
        role: "Expert Worker in Limbe",
        review: "Punctual, thorough, and committed to sustainable waste management practices.",
        avatar_url: null,
        rating: 5,
        created_at: "2024-08-20"
    },
    {
        id: 5,
        worker_name: "Hassan Mohamed",
        role: "Senior Worker in Maroua",
        review: "Professional waste collection with a focus on recycling and environmental conservation.",
        avatar_url: null,
        rating: 4,
        created_at: "2024-08-15"
    }
];

interface WorkerReviewCarouselProps {
    autoPlayInterval?: number;
}

const WorkerReviewCarousel: React.FC<WorkerReviewCarouselProps> = ({
    autoPlayInterval = 4000
}) => {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(true);

    // Auto-scroll functionality
    React.useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % workerReviews.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlayInterval, isPlaying]);

    // Generate initials from name
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Render star rating
    const renderStars = (rating: number): JSX.Element[] => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={i} className="text-yellow-400 text-lg">★</span>
            );
        }

        if (hasHalfStar) {
            stars.push(
                <span key="half" className="text-yellow-400 text-lg">☆</span>
            );
        }

        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <span key={`empty-${i}`} className="text-gray-300 text-lg">☆</span>
            );
        }

        return stars;
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % workerReviews.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + workerReviews.length) % workerReviews.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const currentReview = workerReviews[currentSlide];

    return (
        <div
            className="h-full flex flex-col justify-center p-8 text-white relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            }}
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-white/20 rounded-full"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-md mx-auto text-center">
                <h3 className="text-2xl font-bold mb-6">
                    What Our Workers Say
                </h3>

                {/* Review Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 transition-all duration-500 ease-in-out transform">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-xl font-semibold">
                            {getInitials(currentReview.worker_name)}
                        </div>
                    </div>

                    {/* Worker Info */}
                    <h4 className="text-xl font-semibold mb-1">
                        {currentReview.worker_name}
                    </h4>
                    <p className="text-white/80 text-sm mb-3">
                        {currentReview.role}
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center mb-4">
                        {renderStars(currentReview.rating)}
                    </div>

                    {/* Review Text */}
                    <blockquote className="text-white/90 leading-relaxed">
                        "{currentReview.review}"
                    </blockquote>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center space-x-4">
                    {/* Previous Button */}
                    <button
                        onClick={prevSlide}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                        aria-label="Previous review"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Pagination Dots */}
                    <div className="flex space-x-2">
                        {workerReviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    index === currentSlide
                                        ? 'bg-white w-6'
                                        : 'bg-white/40 hover:bg-white/60'
                                }`}
                                aria-label={`Go to review ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={nextSlide}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
                        aria-label="Next review"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Play/Pause Button */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="mt-4 text-white/60 hover:text-white transition-colors duration-200"
                    aria-label={isPlaying ? 'Pause autoplay' : 'Resume autoplay'}
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    )}
                </button>
            </div>

            {/* Subtle animation indicator */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
                <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{
                        width: isPlaying
                            ? `${((Date.now() % autoPlayInterval) / autoPlayInterval) * 100}%`
                            : '0%'
                    }}
                />
            </div>
        </div>
    );
};

export default WorkerReviewCarousel;
