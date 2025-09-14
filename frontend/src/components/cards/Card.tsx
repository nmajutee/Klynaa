import React from 'react';
import { CardProps } from '@/types';
import styles from './Card.module.css';

/**
 * Card Component
 *
 * A versatile container component with customizable padding, shadows, and borders.
 * Perfect for grouping related content and creating visual hierarchy.
 *
 * @example
 * <Card padding="lg" shadow border>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here...</p>
 * </Card>
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = true,
  border = false,
}) => {
  const cardClasses = [
    styles.card,
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    shadow && styles.shadow,
    border && styles.border,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={cardClasses}>{children}</div>;
};

export default Card;