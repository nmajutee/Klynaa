/**
 * Klynaa Iconography Design System
 *
 * This file implements the comprehensive icon strategy for Klynaa:
 * - Lucide React: Primary UI library (navigation, dashboards, forms)
 * - React Icons (Remix): Domain-specific waste management icons
 * - Phosphor (via React Icons): Mobile-friendly rounded icons
 */

import React from 'react';

// Lucide React Icons (Primary UI Library)
import {
  // Navigation & Dashboard
  LayoutDashboard,
  Home,
  Settings,
  User,
  Users,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,

  // Actions & Forms
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,

  // Communication & Alerts
  Bell,
  Mail,
  Phone,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Lock,

  // Analytics & Data
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,

  // Financial
  DollarSign,
  CreditCard,
  Wallet,

  // General UI
  Eye,
  EyeOff,
  Star,
  Heart,
  Share,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';

// React Icons - Remix Icons (Domain-Specific)
import {
  RiRecycleFill,
  RiRecycleLine,
  RiTruckFill,
  RiTruckLine,
  RiLeafFill,
  RiLeafLine,
  RiEarthFill,
  RiEarthLine,
  RiPlantFill,
  RiPlantLine,
  RiDeleteBinFill,
  RiDeleteBinLine,
  RiMapPin2Fill,
  RiMapPin2Line,
  RiTimeFill,
  RiTimeLine,
  RiShieldCheckFill,
  RiShieldCheckLine,
} from 'react-icons/ri';

// React Icons - Additional Icons for Mobile (using Feather for now)
import {
  FiStar,
  FiHeart,
  FiThumbsUp,
  FiSmile,
} from 'react-icons/fi';

// Icon size tokens
export const IconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
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
  size?: IconSize | number;
  color?: IconColor | string;
  className?: string;
  'aria-label'?: string;
  title?: string;
}

// Shared Icon wrapper component
const IconWrapper: React.FC<BaseIconProps & { children: React.ReactNode }> = ({
  size = 'md',
  color = 'neutral',
  className = '',
  'aria-label': ariaLabel,
  title,
  children,
}) => {
  const iconSize = typeof size === 'number' ? size : IconSizes[size];
  const iconColor = color in IconColors ? IconColors[color as IconColor] : color;

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: iconSize, height: iconSize, color: iconColor }}
      aria-label={ariaLabel}
      title={title}
      role={ariaLabel ? 'img' : undefined}
    >
      {children}
    </span>
  );
};

// Lucide Icons (Primary UI)
export const Icons = {
  // Navigation & Dashboard
  dashboard: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Dashboard'}>
      <LayoutDashboard size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  home: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Home'}>
      <Home size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  users: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Users'}>
      <Users size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  user: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'User'}>
      <User size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  settings: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Settings'}>
      <Settings size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  menu: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Menu'}>
      <Menu size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  close: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Close'}>
      <X size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  chevronDown: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Expand'}>
      <ChevronDown size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Communication
  bell: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Notifications'}>
      <Bell size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  mail: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Email'}>
      <Mail size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  lock: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Lock'}>
      <Lock size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  eye: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Show'}>
      <Eye size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  eyeOff: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Hide'}>
      <EyeOff size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  phone: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Phone'}>
      <Phone size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Analytics
  barChart: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Bar Chart'}>
      <BarChart3 size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  pieChart: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Pie Chart'}>
      <PieChart size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Financial
  dollar: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Earnings'}>
      <DollarSign size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Location
  mapPin: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Location'}>
      <MapPin size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Actions
  plus: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Add'}>
      <Plus size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  edit: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Edit'}>
      <Edit size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  trash: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Delete'}>
      <Trash2 size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Status
  check: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Success'}>
      <CheckCircle size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  alert: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Alert'}>
      <AlertTriangle size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  info: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Information'}>
      <Info size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  star: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Rating'}>
      <Star size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Loading
  loader: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Loading'}>
      <Loader2 className="animate-spin" size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),

  // Time
  clock: (props: BaseIconProps) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Time'}>
      <Clock size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
    </IconWrapper>
  ),
};

// Domain-Specific Icons (Remix Icons)
export const WasteIcons = {
  recycling: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Recycling'}>
      {props.filled ? (
        <RiRecycleFill size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      ) : (
        <RiRecycleLine size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      )}
    </IconWrapper>
  ),

  truck: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Waste Truck'}>
      {props.filled ? (
        <RiTruckFill size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      ) : (
        <RiTruckLine size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      )}
    </IconWrapper>
  ),

  leaf: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Eco Friendly'}>
      {props.filled ? (
        <RiLeafFill size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      ) : (
        <RiLeafLine size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      )}
    </IconWrapper>
  ),

  earth: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Environmental Impact'}>
      {props.filled ? (
        <RiEarthFill size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      ) : (
        <RiEarthLine size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      )}
    </IconWrapper>
  ),

  bin: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Waste Bin'}>
      {props.filled ? (
        <RiDeleteBinFill size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      ) : (
        <RiDeleteBinLine size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      )}
    </IconWrapper>
  ),

  plant: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Sustainability'}>
      {props.filled ? (
        <RiPlantFill size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      ) : (
        <RiPlantLine size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']} />
      )}
    </IconWrapper>
  ),
};

// Mobile-Friendly Icons (Feather Icons for rounded style)
export const MobileIcons = {
  star: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Rating'}>
      <FiStar
        size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']}
        fill={props.filled ? 'currentColor' : 'none'}
      />
    </IconWrapper>
  ),

  heart: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Favorite'}>
      <FiHeart
        size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']}
        fill={props.filled ? 'currentColor' : 'none'}
      />
    </IconWrapper>
  ),

  thumbsUp: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Like'}>
      <FiThumbsUp
        size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']}
        fill={props.filled ? 'currentColor' : 'none'}
      />
    </IconWrapper>
  ),

  smiley: (props: BaseIconProps & { filled?: boolean }) => (
    <IconWrapper {...props} aria-label={props['aria-label'] || 'Happy'}>
      <FiSmile
        size={typeof props.size === 'number' ? props.size : IconSizes[props.size || 'md']}
        fill={props.filled ? 'currentColor' : 'none'}
      />
    </IconWrapper>
  ),
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
          icon: <Icons.check size={size} color="primary" aria-label="Available" />,
          text: 'Available',
          color: 'text-green-600',
        };
      case 'full':
        return {
          icon: <Icons.alert size={size} color="warning" aria-label="Full" />,
          text: 'Full',
          color: 'text-red-600',
        };
      case 'pending':
        return {
          icon: <Icons.clock size={size} color="warning" aria-label="Pending" />,
          text: 'Pending',
          color: 'text-yellow-600',
        };
      case 'completed':
        return {
          icon: <Icons.check size={size} color="primary" aria-label="Completed" />,
          text: 'Completed',
          color: 'text-green-600',
        };
      case 'warning':
        return {
          icon: <Icons.alert size={size} color="warning" aria-label="Warning" />,
          text: 'Warning',
          color: 'text-red-600',
        };
      default:
        return {
          icon: <Icons.info size={size} color="neutral" aria-label="Unknown" />,
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