import React from 'react';
import { CardContainerProps } from '../../../types/dashboard';
import styles from './CardContainer.module.css';

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  title,
  subtitle,
  action,
  loading = false,
  className = '',
  padding = 'md'
}) => {
  return (
    <div
      className={`${styles.card} ${styles[`padding-${padding}`]} ${loading ? styles.loading : ''} ${className}`}
      role="region"
      aria-label={title}
    >
      {(title || subtitle || action) && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {title && (
              <h3 className={styles.title}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={styles.subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className={styles.action}>
              {action}
            </div>
          )}
        </div>
      )}

      <div className={styles.body}>
        {loading ? (
          <div className={styles.skeleton} aria-label="Loading content">
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default CardContainer;