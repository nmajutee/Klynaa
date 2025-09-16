import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import CardContainer from '../../layout/CardContainer/CardContainer';
import { ReviewsData, Review } from '../../../types/dashboard';
import styles from './ReviewsWidget.module.css';

export interface ReviewsWidgetProps {
  title: string;
  subtitle?: string;
  data: ReviewsData;
  loading?: boolean;
  className?: string;
  showDistribution?: boolean;
  maxReviews?: number;
}

/**
 * ReviewsWidget - Display recent reviews with star ratings and distribution
 * Features rating distribution, recent reviews list, and responsive design
 */
export const ReviewsWidget: React.FC<ReviewsWidgetProps> = ({
  title,
  subtitle,
  data,
  loading = false,
  className = '',
  showDistribution = true,
  maxReviews = 5
}) => {
  const recentReviews = data.recent.slice(0, maxReviews);
  const totalReviews = data.distribution.reduce((sum, count) => sum + count, 0);

  // Calculate average rating from distribution
  const averageRating = totalReviews > 0
    ? data.distribution.reduce((sum, count, index) => sum + count * (5 - index), 0) / totalReviews
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const stars = [];
    const sizeClass = size === 'sm' ? styles.starSm : styles.starMd;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      const StarComponent = isFilled ? StarIcon : StarOutlineIcon;
      stars.push(
        <StarComponent
          key={i}
          className={`${sizeClass} ${isFilled ? styles.starFilled : styles.starEmpty}`}
        />
      );
    }

    return <div className={styles.starRating}>{stars}</div>;
  };

  const renderDistribution = () => {
    if (!showDistribution) return null;

    return (
      <div className={styles.distribution}>
        <div className={styles.averageSection}>
          <div className={styles.averageRating}>
            {averageRating.toFixed(1)}
          </div>
          {renderStarRating(Math.round(averageRating), 'md')}
          <div className={styles.totalReviews}>
            {totalReviews} reviews
          </div>
        </div>

        <div className={styles.breakdown}>
          {data.distribution.map((count, index) => {
            const stars = 5 - index;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className={styles.breakdownRow}>
                <div className={styles.breakdownStars}>
                  {stars} {renderStarRating(1, 'sm')}
                </div>
                <div className={styles.breakdownBar}>
                  <div
                    className={styles.breakdownFill}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className={styles.breakdownCount}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReviewsList = () => {
    if (recentReviews.length === 0) {
      return (
        <div className={styles.noReviews}>
          No recent reviews available
        </div>
      );
    }

    return (
      <div className={styles.reviewsList}>
        {recentReviews.map((review) => (
          <div key={review.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.customerName}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={styles.reviewerName}>{review.customerName}</div>
                  <div className={styles.reviewDate}>{formatDate(review.date)}</div>
                </div>
              </div>
              {renderStarRating(review.rating)}
            </div>

            <div className={styles.reviewContent}>
              <p className={styles.reviewText}>{review.text}</p>
              {review.comment && (
                <p className={styles.reviewComment}>{review.comment}</p>
              )}

              {review.tags && review.tags.length > 0 && (
                <div className={styles.reviewTags}>
                  {review.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <CardContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      className={`${styles.reviewsWidget} ${className}`}
    >
      {showDistribution && renderDistribution()}
      {showDistribution && <div className={styles.divider} />}
      {renderReviewsList()}
    </CardContainer>
  );
};

export default ReviewsWidget;