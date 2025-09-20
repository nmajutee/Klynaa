// Cleaned global declarations: removed shadowing of React/ReactDOM to allow official @types packages to work.
import { ReactNode } from 'react';

declare module 'next/head' {
  import { ComponentType } from 'react';
  const Head: ComponentType<{ children?: ReactNode }>;
  export default Head;
}

declare module 'next/link' {
  import { ComponentType } from 'react';
  interface LinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/router' {
  export interface NextRouter {
    push(url: string): Promise<boolean>;
    pathname: string;
    query: { [key: string]: string | string[] };
  }

  export function useRouter(): NextRouter;
}

declare module '@heroicons/react/24/outline' {
  import { ComponentType } from 'react';
  interface IconProps {
    className?: string;
    size?: number;
    [key: string]: any;
  }

  export const ArrowPathIcon: ComponentType<IconProps>;
  export const UserGroupIcon: ComponentType<IconProps>;
  export const GlobeAltIcon: ComponentType<IconProps>;
  export const HeartIcon: ComponentType<IconProps>;
  export const ChartBarIcon: ComponentType<IconProps>;
  export const TruckIcon: ComponentType<IconProps>;
  export const BuildingOfficeIcon: ComponentType<IconProps>;
  export const UsersIcon: ComponentType<IconProps>;
  export const StarIcon: ComponentType<IconProps>;
  export const CheckCircleIcon: ComponentType<IconProps>;
  export const HomeIcon: ComponentType<IconProps>;
  export const BoltIcon: ComponentType<IconProps>;
  export const ClockIcon: ComponentType<IconProps>;
  export const CurrencyDollarIcon: ComponentType<IconProps>;
  export const MapPinIcon: ComponentType<IconProps>;
  export const TrashIcon: ComponentType<IconProps>;
  export const ExclamationTriangleIcon: ComponentType<IconProps>;
  export const PhoneIcon: ComponentType<IconProps>;
  export const CalendarClock: ComponentType<IconProps>;
  export const Bars3Icon: ComponentType<IconProps>;
  export const XMarkIcon: ComponentType<IconProps>;
  export const ChevronLeftIcon: ComponentType<IconProps>;
  export const ChevronRightIcon: ComponentType<IconProps>;
  export const SparklesIcon: ComponentType<IconProps>;
  export const CalendarDaysIcon: ComponentType<IconProps>;
  export const ShieldCheckIcon: ComponentType<IconProps>;
  export const AcademicCapIcon: ComponentType<IconProps>;
}

declare module 'lucide-react' {
  import { ComponentType } from 'react';
  interface IconProps {
    size?: number;
    className?: string;
    [key: string]: any;
  }

  export const Search: ComponentType<IconProps>;
  export const Briefcase: ComponentType<IconProps>;
  export const Rocket: ComponentType<IconProps>;
  export const UserPlus: ComponentType<IconProps>;
  export const CalendarClock: ComponentType<IconProps>;
}

export {};

// Re-export types from our new location for backwards compatibility
export type {
  User,
  Bin,
  Pickup,
  LoginForm as LoginCredentials,
  RegisterForm as RegisterData,
  BinForm as BinCreateData,
  PickupRequestForm as PickupCreateData,
  PickupRequestForm as PickupRequest,
  ApiResponse,
  ApiError,
  WorkerStats,
  CustomerStats as DashboardStats,
  Notification
} from '../src/types';

// Legacy types for backwards compatibility
export interface AuthResponse {
  access: string;
  refresh: string;
  user: any;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ReviewCreateData {
  rating: number;
  comment?: string;
}