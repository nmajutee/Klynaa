/**
 * ProfileSnapshotCard - Worker Profile Overview Card
 * Shows name, status indicator, completed pickups, reviews, badges
 * Following Klynaa enterprise design standards
 */

import React from 'react';
import {
  UserIcon,
  CheckBadgeIcon,
  StarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import CardContainer from '../layout/CardContainer';
import styles from './ProfileSnapshotCard.module.css';

export interface WorkerProfile {
  name: string;
  status: 'active' | 'busy' | 'offline';
  completedPickups: number;
  totalReviews: number;
  averageRating: number;
  badges: string[];
  avatar?: string;
}

export interface ProfileSnapshotCardProps {
  profile: WorkerProfile;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const ProfileSnapshotCard: React.FC<ProfileSnapshotCardProps> = ({
  profile,
  loading = false,
  className = '',
  onClick
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'busy': return 'var(--warning)';
      case 'offline': return 'var(--muted)';
      default: return 'var(--muted)';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Available';
      case 'busy': return 'On Pickup';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatRating = (rating: number): string => {
    return rating.toFixed(1);
  };

  return (
    <CardContainer
      loading={loading}
      className={`${styles.profileCard} ${className}`}
      padding="lg"
    >
      <div className={styles.content}>
        {/* Header with Avatar and Status */}
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={`${profile.name}'s profile`}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <UserIcon className={styles.avatarIcon} />
              </div>
            )}
            <div 
              className={styles.statusDot}
              style={{ backgroundColor: getStatusColor(profile.status) }}
              aria-label={`Status: ${getStatusLabel(profile.status)}`}
            />
          </div>
          
          <div className={styles.nameSection}>
            <h4 className={styles.name}>{profile.name}</h4>
            <span 
              className={styles.statusLabel}
              style={{ color: getStatusColor(profile.status) }}
            >
              {getStatusLabel(profile.status)}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <div className={styles.statIcon}>
              <TruckIcon />
            </div>
            <div className={styles.statValue}>
              {profile.completedPickups}
            </div>
            <div className={styles.statLabel}>
              Completed
            </div>
          </div>
          
          <div className={styles.stat}>
            <div className={styles.statIcon}>
              <StarIcon />
            </div>
            <div className={styles.statValue}>
              {formatRating(profile.averageRating)}
            </div>
            <div className={styles.statLabel}>
              Rating
            </div>
          </div>
          
          <div className={styles.stat}>
            <div className={styles.statIcon}>
              <CheckBadgeIcon />
            </div>
            <div className={styles.statValue}>
              {profile.badges.length}
            </div>
            <div className={styles.statLabel}>
              Badges
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {profile.badges.length > 0 && (
          <div className={styles.badgesSection}>
            <div className={styles.badgesLabel}>Achievements</div>
            <div className={styles.badges}>
              {profile.badges.slice(0, 3).map((badge, index) => (
                <span key={index} className={styles.badge}>
                  {badge}
                </span>
              ))}
              {profile.badges.length > 3 && (
                <span className={styles.badge}>
                  +{profile.badges.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </CardContainer>
  );
};

export default ProfileSnapshotCard;