import React, { useState } from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import { useAuthStore } from '../../stores';
import {
    StarIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    UserCircleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface Review {
    id: number;
    pickupId: number;
    customerName: string;
    rating: number;
    feedback: string;
    date: string;
    pickupType: string;
    location: string;
}

interface RatingStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    recentTrend: 'up' | 'down' | 'stable';
}

const Reviews = () => {
    const { user } = useAuthStore();
    const [filterRating, setFilterRating] = useState<number | null>(null);

    // Mock data - replace with actual API call
    const stats: RatingStats = {
        averageRating: 4.7,
        totalReviews: 45,
        ratingDistribution: {
            5: 32,
            4: 8,
            3: 3,
            2: 1,
            1: 1
        },
        recentTrend: 'up'
    };

    const reviews: Review[] = [
        {
            id: 1,
            pickupId: 1236,
            customerName: 'Marie Ngando',
            rating: 5,
            feedback: 'Excellent service! Very professional and punctual. The worker was courteous and handled our waste efficiently.',
            date: 'Yesterday',
            pickupType: 'General Waste',
            location: 'Douala, Bonanjo'
        },
        {
            id: 2,
            pickupId: 1235,
            customerName: 'Jean Baptiste',
            rating: 5,
            feedback: 'Outstanding! Arrived on time and was very careful with the recyclable materials. Highly recommend!',
            date: '2 days ago',
            pickupType: 'Recyclable',
            location: 'Douala, Akwa'
        },
        {
            id: 3,
            pickupId: 1234,
            customerName: 'Paul Mbarga',
            rating: 4,
            feedback: 'Good service overall. The worker was professional but arrived about 10 minutes late. Still satisfied with the work.',
            date: '3 days ago',
            pickupType: 'General Waste',
            location: 'Douala, Bassa'
        },
        {
            id: 4,
            pickupId: 1233,
            customerName: 'Fatou Diallo',
            rating: 5,
            feedback: 'Perfect service! Very friendly worker who explained the proper sorting process. Will definitely request again.',
            date: '1 week ago',
            pickupType: 'Organic',
            location: 'Douala, New Bell'
        },
        {
            id: 5,
            pickupId: 1232,
            customerName: 'Sarah Kom',
            rating: 4,
            feedback: 'Professional and efficient. The only minor issue was that the worker forgot to close the gate properly.',
            date: '1 week ago',
            pickupType: 'General Waste',
            location: 'Douala, Bonapriso'
        }
    ];

    const filteredReviews = filterRating
        ? reviews.filter(review => review.rating === filterRating)
        : reviews;

    const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
        const sizeClasses = {
            sm: 'h-3 w-3',
            md: 'h-4 w-4',
            lg: 'h-6 w-6'
        };

        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        className={`${sizeClasses[size]} ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const getProgressWidth = (count: number) => {
        return (count / stats.totalReviews) * 100;
    };

    return (
        <WorkerLayout>
            <Head>
                <title>Reviews & Ratings - Worker Portal</title>
            </Head>

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Track your customer satisfaction and reputation score
                        </p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <StarIcon className="h-8 w-8 mr-4" />
                                <div>
                                    <p className="text-sm text-yellow-100">Average Rating</p>
                                    <p className="text-3xl font-bold">{stats.averageRating}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow">
                            <div className="flex items-center">
                                <div className="bg-blue-500 rounded-lg p-3 mr-4">
                                    <ChartBarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Reviews</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.totalReviews}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow">
                            <div className="flex items-center">
                                <div className="bg-green-500 rounded-lg p-3 mr-4">
                                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Recent Trend</p>
                                    <p className="text-2xl font-semibold text-green-600 capitalize">{stats.recentTrend}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow">
                            <div className="flex items-center">
                                <div className="bg-purple-500 rounded-lg p-3 mr-4">
                                    <CalendarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">This Month</p>
                                    <p className="text-2xl font-semibold text-gray-900">12</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="bg-white rounded-lg shadow mb-8 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Rating Distribution</h2>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center">
                                    <div className="flex items-center space-x-2 w-20">
                                        <span className="text-sm font-medium text-gray-900">{rating}</span>
                                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${getProgressWidth(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-8 text-right">
                                        {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilterRating(null)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filterRating === null
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    All
                                </button>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setFilterRating(rating)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            filterRating === rating
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {rating} ★
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {filteredReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filterRating
                                        ? `No reviews with ${filterRating} stars found.`
                                        : 'Your customer reviews will appear here after completed pickups.'
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredReviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow border p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="h-12 w-12 bg-gray-400 rounded-full flex items-center justify-center">
                                                <UserCircleIcon className="h-7 w-7 text-white" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {review.customerName}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">•</span>
                                                    <span className="text-sm text-gray-500">{review.date}</span>
                                                </div>

                                                <div className="flex items-center space-x-2 mb-2">
                                                    {renderStars(review.rating)}
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {review.rating}/5
                                                    </span>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-3 space-y-1">
                                                    <div>Pickup #{review.pickupId} • {review.pickupType}</div>
                                                    <div>{review.location}</div>
                                                </div>

                                                <p className="text-gray-700 leading-relaxed">
                                                    "{review.feedback}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Tips Section */}
                    <div className="mt-12 bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-blue-900 mb-4">Tips to Improve Your Ratings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <h4 className="font-medium mb-2">Communication</h4>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• Send arrival notifications</li>
                                    <li>• Communicate any delays</li>
                                    <li>• Be polite and professional</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Service Quality</h4>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• Arrive on time</li>
                                    <li>• Handle waste carefully</li>
                                    <li>• Clean up any spills</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkerLayout>
    );
};

export default Reviews;