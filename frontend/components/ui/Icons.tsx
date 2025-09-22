/**
 * Klynaa MVP Icon Strategy - LineIcons Integration
 *
 * Web App (Admin, Worker, Bin Owner Dashboards):
 * ✅ LineIcons → All UI/system icons (navigation, analytics, payouts)
 * ✅ Domain-specific icons → Custom implementations for waste management
 *
 * Benefits:
 * - Unified icon library with consistent design
 * - Rich set of 26,000+ icons available
 * - Built-in effects and animations
 * - Excellent web performance
 *
 * Migration Strategy:
 * 🚀 Replacing Lucide React with LineIcons systematically across all components
 */

import React from 'react';

// LineIcons Type Declaration (inline since @types/react-lineicons doesn't exist)
interface LineIconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  effect?: 'spin' | 'tada' | 'flashing' | 'burst' | 'fade-left' | 'fade-right' | 'fade-up' | 'fade-down';
  tag?: string;
  style?: React.CSSProperties;
  className?: string;
  [key: string]: any;
}

// LineIcon component import (with type assertion)
const LineIcon = require('react-lineicons') as React.FC<LineIconProps>;

// Icon size tokens
export const IconSizes = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const;

// Icon color tokens
export const IconColors = {
  primary: '#16A34A',     // Green - Eco/Positive actions
  warning: '#DC2626',     // Red - Urgent, alerts, errors
  neutral: '#6B7280',     // Gray - Secondary, inactive
  dark: '#1C1C1C',       // Dark gray for emphasis
  light: '#9E9E9E',      // Light gray for subtle elements
} as const;

export type IconSize = keyof typeof IconSizes;
export type IconColor = keyof typeof IconColors;

// Base Icon Component Props
interface BaseIconProps {
  size?: IconSize;
  color?: IconColor | string;
  className?: string;
  effect?: 'spin' | 'tada' | 'flashing' | 'burst' | 'fade-left' | 'fade-right' | 'fade-up' | 'fade-down';
  'aria-label'?: string;
  title?: string;
}

// LineIcon wrapper component
const Icon: React.FC<BaseIconProps & { name: string }> = ({
  name,
  size = 'md',
  color,
  className = '',
  effect,
  'aria-label': ariaLabel,
  title,
  ...props
}) => {
  const iconColor = color && color in IconColors ? IconColors[color as IconColor] : color;

  return (
    <LineIcon
      name={name}
      size={IconSizes[size]}
      effect={effect}
      style={iconColor ? { color: iconColor } : undefined}
      className={className}
      aria-label={ariaLabel}
      title={title}
      {...props}
    />
  );
};

// Main Icons Export - LineIcons Implementation
export const Icons = {
  // Navigation & Dashboard
  dashboard: (props: BaseIconProps) => <Icon name="dashboard" {...props} />,
  home: (props: BaseIconProps) => <Icon name="home" {...props} />,
  users: (props: BaseIconProps) => <Icon name="users" {...props} />,
  user: (props: BaseIconProps) => <Icon name="user" {...props} />,
  settings: (props: BaseIconProps) => <Icon name="cog" {...props} />,
  menu: (props: BaseIconProps) => <Icon name="menu" {...props} />,
  close: (props: BaseIconProps) => <Icon name="close" {...props} />,

  // Navigation Arrows
  arrowLeft: (props: BaseIconProps) => <Icon name="arrow-left" {...props} />,
  arrowRight: (props: BaseIconProps) => <Icon name="arrow-right" {...props} />,
  chevronDown: (props: BaseIconProps) => <Icon name="chevron-down" {...props} />,
  chevronLeft: (props: BaseIconProps) => <Icon name="chevron-left" {...props} />,
  chevronRight: (props: BaseIconProps) => <Icon name="chevron-right" {...props} />,

  // Communication & Alerts
  bell: (props: BaseIconProps) => <Icon name="bell" {...props} />,
  mail: (props: BaseIconProps) => <Icon name="envelope" {...props} />,
  phone: (props: BaseIconProps) => <Icon name="phone" {...props} />,

  // Authentication & Security
  lock: (props: BaseIconProps) => <Icon name="lock-alt" {...props} />,
  shield: (props: BaseIconProps) => <Icon name="shield" {...props} />,
  key: (props: BaseIconProps) => <Icon name="key" {...props} />,
  eye: (props: BaseIconProps) => <Icon name="eye" {...props} />,
  eyeOff: (props: BaseIconProps) => <Icon name="eye-close" {...props} />,

  // Status & Alerts
  checkCircle: (props: BaseIconProps) => <Icon name="checkmark-circle" {...props} />,
  alertTriangle: (props: BaseIconProps) => <Icon name="warning" {...props} />,
  alertCircle: (props: BaseIconProps) => <Icon name="circle-alert" {...props} />,
  info: (props: BaseIconProps) => <Icon name="information" {...props} />,
  check: (props: BaseIconProps) => <Icon name="checkmark" {...props} />,

  // Analytics & Data
  barChart: (props: BaseIconProps) => <Icon name="bar-chart" {...props} />,
  pieChart: (props: BaseIconProps) => <Icon name="pie-chart" {...props} />,
  trendingUp: (props: BaseIconProps) => <Icon name="trending-up" {...props} />,

  // Time & Calendar
  clock: (props: BaseIconProps) => <Icon name="time" {...props} />,
  calendar: (props: BaseIconProps) => <Icon name="calendar" {...props} />,

  // Financial
  dollar: (props: BaseIconProps) => <Icon name="dollar" {...props} />,
  creditCard: (props: BaseIconProps) => <Icon name="credit-card" {...props} />,
  wallet: (props: BaseIconProps) => <Icon name="wallet" {...props} />,

  // Location
  mapPin: (props: BaseIconProps) => <Icon name="map-marker" {...props} />,

  // Actions
  plus: (props: BaseIconProps) => <Icon name="plus" {...props} />,
  edit: (props: BaseIconProps) => <Icon name="pencil" {...props} />,
  trash: (props: BaseIconProps) => <Icon name="trash" {...props} />,
  upload: (props: BaseIconProps) => <Icon name="upload" {...props} />,
  download: (props: BaseIconProps) => <Icon name="download" {...props} />,
  search: (props: BaseIconProps) => <Icon name="search" {...props} />,
  filter: (props: BaseIconProps) => <Icon name="filter" {...props} />,
  refresh: (props: BaseIconProps) => <Icon name="reload" {...props} />,

  // Documents & Files
  fileText: (props: BaseIconProps) => <Icon name="file-document" {...props} />,

  // Business
  briefcase: (props: BaseIconProps) => <Icon name="briefcase" {...props} />,
  building: (props: BaseIconProps) => <Icon name="building" {...props} />,

  // Transport
  truck: (props: BaseIconProps) => <Icon name="delivery" {...props} />,

  // Social & Interaction
  star: (props: BaseIconProps) => <Icon name="star" {...props} />,
  heart: (props: BaseIconProps) => <Icon name="heart" {...props} />,
  share: (props: BaseIconProps) => <Icon name="share" {...props} />,
  copy: (props: BaseIconProps) => <Icon name="copy" {...props} />,
  externalLink: (props: BaseIconProps) => <Icon name="external-link" {...props} />,

  // System Actions
  logout: (props: BaseIconProps) => <Icon name="exit" {...props} />,

  // Loading & Progress
  loader: (props: BaseIconProps) => <Icon name="spinner" effect="spin" {...props} />,

  // Special Effects
  zap: (props: BaseIconProps) => <Icon name="bolt" {...props} />,

  // Circles & Progress
  circle: (props: BaseIconProps) => <Icon name="circle" {...props} />,
};

// Domain-Specific Icons for Waste Management (using custom LineIcons)
export const WasteIcons = {
  recycling: (props: BaseIconProps) => <Icon name="recycle" {...props} />,
  truck: (props: BaseIconProps) => <Icon name="delivery" {...props} />,
  leaf: (props: BaseIconProps) => <Icon name="leaf" {...props} />,
  earth: (props: BaseIconProps) => <Icon name="world" {...props} />,
  bin: (props: BaseIconProps) => <Icon name="trash" {...props} />,
  plant: (props: BaseIconProps) => <Icon name="grow" {...props} />,
};

// Status Indicator Helper
export const StatusIcon: React.FC<{
  status: 'available' | 'full' | 'pending' | 'completed' | 'warning';
  size?: IconSize;
  showText?: boolean;
}> = ({ status, size = 'md', showText = false }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          icon: <Icons.checkCircle size={size} color="primary" />,
          text: 'Available',
          color: 'text-green-600',
        };
      case 'full':
        return {
          icon: <Icons.alertTriangle size={size} color="warning" />,
          text: 'Full',
          color: 'text-red-600',
        };
      case 'pending':
        return {
          icon: <Icons.clock size={size} color="warning" />,
          text: 'Pending',
          color: 'text-yellow-600',
        };
      case 'completed':
        return {
          icon: <Icons.checkCircle size={size} color="primary" />,
          text: 'Completed',
          color: 'text-green-600',
        };
      case 'warning':
        return {
          icon: <Icons.alertTriangle size={size} color="warning" />,
          text: 'Warning',
          color: 'text-red-600',
        };
      default:
        return {
          icon: <Icons.info size={size} color="neutral" />,
          text: 'Unknown',
          color: 'text-gray-600',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center space-x-2">
      {config.icon}
      {showText && <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>}
    </div>
  );
};

export default Icons;