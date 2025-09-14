/**
 * PickupCard Component
 * Reusable card component for displaying pickup information
 */

import React from 'react';
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import type { AvailablePickup, WorkerPickup } from '../../types';
import styles from './PickupCard.module.css';

// Type guard to determine pickup type
const isAvailablePickup = (pickup: AvailablePickup | WorkerPickup): pickup is AvailablePickup => {
  return 'distance' in pickup && 'reward' in pickup;
};

export interface PickupCardProps {
  pickup: AvailablePickup | WorkerPickup;
  variant?: 'available' | 'assigned' | 'completed';
  onAction?: (pickup: AvailablePickup | WorkerPickup) => void;
  actionLabel?: string;
  showDetails?: boolean;
  className?: string;
}

export const PickupCard: React.FC<PickupCardProps> = ({
  pickup,
  variant = 'available',
  onAction,
  actionLabel,
  showDetails = true,
  className = '',
}) => {
  const available = isAvailablePickup(pickup);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'organic':
        return styles.typeOrganic;
      case 'recyclable':
        return styles.typeRecyclable;
      case 'hazardous':
        return styles.typeHazardous;
      default:
        return styles.typeGeneral;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return styles.priorityHigh;
      case 'medium':
        return styles.priorityMedium;
      default:
        return styles.priorityLow;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'in_progress':
        return styles.statusInProgress;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const formatTime = (time: string) => {
    // Simple time formatting - can be enhanced
    return time.includes('ago') ? time : new Date(time).toLocaleString();
  };

  return (
    <div className={`${styles.pickupCard} ${styles[variant]} ${className}`}>
      <div className={styles.header}>
        <div className={styles.typeAndPriority}>
          <span className={`${styles.typeBadge} ${getTypeColor(pickup.type)}`}>
            {pickup.type}
          </span>
          {available && pickup.priority && (
            <span className={`${styles.priorityBadge} ${getPriorityColor(pickup.priority)}`}>
              {pickup.priority}
            </span>
          )}
          {!available && 'status' in pickup && (
            <span className={`${styles.statusBadge} ${getStatusColor(pickup.status)}`}>
              {pickup.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {available && pickup.timePosted && (
          <span className={styles.timePosted}>{pickup.timePosted}</span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.location}>
          <MapPinIcon className={styles.locationIcon} />
          <span className={styles.locationText}>{pickup.location}</span>
        </div>

        <div className={styles.customer}>
          <UserIcon className={styles.customerIcon} />
          <span className={styles.customerName}>
            {available ? pickup.customerName : (pickup as WorkerPickup).customerName}
          </span>
        </div>

        {showDetails && (
          <div className={styles.details}>
            {available && (
              <>
                <div className={styles.detail}>
                  <MapPinIcon className={styles.detailIcon} />
                  <span>{pickup.distance}km away</span>
                </div>
                <div className={styles.detail}>
                  <CurrencyDollarIcon className={styles.detailIcon} />
                  <span>{pickup.reward.toLocaleString()} XAF</span>
                </div>
                <div className={styles.detail}>
                  <ClockIcon className={styles.detailIcon} />
                  <span>~{pickup.estimatedTime}min</span>
                </div>
              </>
            )}

            {!available && (
              <>
                <div className={styles.detail}>
                  <CurrencyDollarIcon className={styles.detailIcon} />
                  <span>{(pickup as WorkerPickup).earnings?.toLocaleString()} XAF</span>
                </div>
                <div className={styles.detail}>
                  <ClockIcon className={styles.detailIcon} />
                  <span>
                    {(pickup as WorkerPickup).actualTime
                      ? `${(pickup as WorkerPickup).actualTime}min`
                      : `~${(pickup as WorkerPickup).estimatedTime}min`
                    }
                  </span>
                </div>
                {(pickup as WorkerPickup).rating && (
                  <div className={styles.detail}>
                    <StarIcon className={styles.detailIcon} />
                    <span>{(pickup as WorkerPickup).rating?.toFixed(1)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {(pickup as WorkerPickup).customerFeedback && (
          <div className={styles.feedback}>
            <p className={styles.feedbackText}>"{(pickup as WorkerPickup).customerFeedback}"</p>
          </div>
        )}
      </div>

      {onAction && (
        <div className={styles.actions}>
          <button
            onClick={() => onAction(pickup)}
            className={`${styles.actionButton} ${styles[variant]}`}
          >
            {actionLabel || (available ? 'Accept' : 'View Details')}
          </button>
        </div>
      )}
    </div>
  );
};