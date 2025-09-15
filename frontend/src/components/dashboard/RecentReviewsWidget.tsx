/**
 * RecentReviewsWidget Component - Enterprise Grade
 * Displays recent customer reviews and ratings with interactive features
 */

import React, { useState, useMemo } from 'react';
import {
  StarIcon,
  UserCircleIcon,
  ChevronRightIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { colors, spacing, borderRadius } from '../../design-system/tokens';

// Types
export interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  pickupId: string;
  location: string;
  isVerified?: boolean;
  tags?: string[];
}

export interface ReviewStats {
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

// Props
export interface RecentReviewsWidgetProps {
  reviews: Review[];
  stats: ReviewStats;
  isLoading?: boolean;
  className?: string;
  maxReviews?: number;
  onViewAll?: () => void;
  onReviewClick?: (review: Review) => void;
  showStats?: boolean;
}

/**
 * Rating Stars Component
 */
const RatingStars: React.FC<{
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showNumber?: boolean;
}> = ({
  rating,
  size = 'sm',
  interactive = false,
  showNumber = false
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const starSize = sizeClasses[size];

  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {star <= rating ? (
              <StarIconSolid className={`${starSize} text-yellow-400`} />
            ) : star - 1 < rating ? (
              <div className="relative">
                <StarIcon className={`${starSize} text-gray-300`} />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${((rating - Math.floor(rating)) * 100)}%` }}
                >
                  <StarIconSolid className={`${starSize} text-yellow-400`} />
                </div>
              </div>
            ) : (
              <StarIcon className={`${starSize} text-gray-300`} />
            )}
          </div>
        ))}
      </div>
      {showNumber && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

/**
 * Customer Avatar Component
 */
const CustomerAvatar: React.FC<{
  name: string;
  avatar?: string;
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ name, avatar, isVerified, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const badgeClasses = {
    sm: 'w-2 h-2 -top-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -top-1 -right-1',
    lg: 'w-3 h-3 -top-1 -right-1'
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="relative">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-700`}>
          {initials}
        </div>
      )}

      {isVerified && (
        <div className={`absolute ${badgeClasses[size]} bg-green-500 rounded-full border-2 border-white`} />
      )}
    </div>
  );
};

/**
 * Review Card Component
 */
const ReviewCard: React.FC<{
  review: Review;
  onClick?: () => void;
  compact?: boolean;
}> = ({ review, onClick, compact = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className={`p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <CustomerAvatar
            name={review.customerName}
            avatar={review.customerAvatar}
            isVerified={review.isVerified}
            size="md"
          />
          <div className="ml-3">
            <div className="flex items-center">
              <h4 className="text-sm font-medium text-gray-900">
                {review.customerName}
              </h4>
              {review.isVerified && (
                <span className="ml-1 text-xs text-green-600">✓</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{formatDate(review.date)}</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <RatingStars rating={review.rating} size="sm" />
          <span className={`text-xs font-medium mt-1 ${getRatingColor(review.rating)}`}>
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {!compact && (
        <>
          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {review.comment}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>📍 {review.location}</span>
            {onClick && <ChevronRightIcon className="w-4 h-4" />}
          </div>

          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {review.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {review.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{review.tags.length - 3} more</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Rating Distribution Chart
 */
const RatingDistribution: React.FC<{
  distribution: ReviewStats['ratingDistribution'];
  totalReviews: number;
}> = ({ distribution, totalReviews }) => {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center text-sm">
            <span className="w-3 text-gray-600">{rating}</span>
            <StarIconSolid className="w-3 h-3 text-yellow-400 ml-1" />
            <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Reviews Stats Summary
 */
const ReviewsStats: React.FC<{
  stats: ReviewStats;
}> = ({ stats }) => {
  const getTrendIcon = () => {
    switch (stats.recentTrend) {
      case 'up':
        return <FaceSmileIcon className="w-5 h-5 text-green-500" />;
      case 'down':
        return <FaceFrownIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrendText = () => {
    switch (stats.recentTrend) {
      case 'up':
        return 'Trending up';
      case 'down':
        return 'Needs attention';
      default:
        return 'Stable';
    }
  };

  const getTrendColor = () => {
    switch (stats.recentTrend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {stats.averageRating.toFixed(1)}
          </div>
          <RatingStars rating={stats.averageRating} size="md" />
          <div className="text-sm text-gray-500 mt-1">
            {stats.totalReviews} reviews
          </div>
        </div>

        <div className="flex items-center">
          {getTrendIcon()}
          <span className={`ml-1 text-sm font-medium ${getTrendColor()}`}>
            {getTrendText()}
          </span>
        </div>
      </div>

      <RatingDistribution
        distribution={stats.ratingDistribution}
        totalReviews={stats.totalReviews}
      />
    </div>
  );
};

/**
 * Main RecentReviewsWidget Component
 */
export const RecentReviewsWidget: React.FC<RecentReviewsWidgetProps> = ({
  reviews,
  stats,
  isLoading = false,
  className = '',
  maxReviews = 5,
  onViewAll,
  onReviewClick,
  showStats = true
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedReviews = useMemo(() => {
    if (showAll) return reviews;
    return reviews.slice(0, maxReviews);
  }, [reviews, maxReviews, showAll]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
          {showStats && (
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="h-2 bg-gray-300 rounded flex-1"></div>
                    <div className="h-3 w-6 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Reviews
            </h3>
            <p className="text-sm text-gray-600">
              Customer feedback and ratings
            </p>
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </button>
          )}
        </div>

        {/* Stats */}
        {showStats && stats.totalReviews > 0 && (
          <div className="mb-6">
            <ReviewsStats stats={stats} />
          </div>
        )}

        {/* Reviews List */}
        {displayedReviews.length > 0 ? (
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onClick={() => onReviewClick?.(review)}
              />
            ))}

            {reviews.length > maxReviews && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Show {reviews.length - maxReviews} more reviews
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500">
              Customer reviews will appear here after your first completed pickup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentReviewsWidget;