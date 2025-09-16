import React from 'react';
import { ReviewsData } from '@/types/dashboard';
import styles from './ReviewsWidget.module.css';

interface ReviewsWidgetProps {
  data: ReviewsData;
  className?: string;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({
  rating,
  size = 'sm'
}) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`${styles.star} ${styles[size]} ${
        i < rating ? styles.filled : styles.empty
      }`}
    >
      ★
    </span>
  ));

  return <div className={styles.starRating}>{stars}</div>;
};

export const ReviewsWidget: React.FC<ReviewsWidgetProps> = ({
  data,
  className = '',
}) => {
  const hasReviews = data.recent.length > 0;
  const totalReviews = data.distribution.reduce((sum, count) => sum + count, 0);

  // Calculate average rating from distribution
  const weightedSum = data.distribution.reduce((sum, count, index) => {
    return sum + (count * (5 - index)); // 5-star at index 0, 1-star at index 4
  }, 0);
  const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

  return (
    <div className={`${styles.reviewsWidget} ${className}`}>
      {hasReviews ? (
        <>
          {/* Rating Summary */}
          <div className={styles.ratingSummary}>
            <div className={styles.averageRating}>
              <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
              <StarRating rating={Math.round(averageRating)} size="md" />
              <span className={styles.reviewCount}>
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className={styles.distribution}>
            <h4 className={styles.distributionTitle}>Rating Distribution</h4>
            {data.distribution.map((count, index) => {
              const starLevel = 5 - index; // Convert index to star level
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={starLevel} className={styles.distributionRow}>
                  <span className={styles.starLevel}>{starLevel}★</span>
                  <div className={styles.distributionBar}>
                    <div
                      className={styles.distributionFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.distributionCount}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Recent Reviews */}
          {data.recent.length > 0 && (
            <div className={styles.recentReviews}>
              <h4 className={styles.recentTitle}>Recent Reviews</h4>
              <div className={styles.reviewsList}>
                {data.recent.map((review) => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <StarRating rating={review.rating} />
                      <span className={styles.reviewDate}>
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                    <span className={styles.reviewCustomer}>
                      — {review.customerName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭐</div>
          <h4 className={styles.emptyTitle}>No Reviews Yet</h4>
          <p className={styles.emptyMessage}>
            Complete more pickups to start receiving customer reviews
          </p>
        </div>
      )}
    </div>
  );
};