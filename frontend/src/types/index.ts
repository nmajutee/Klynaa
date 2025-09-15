/**
 * Klynaa TypeScript Types
 * Centralized type definitions for the entire application
 */

// ========================================
// Core Entity Types
// ========================================

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string;
  is_verified: boolean;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  rating_average?: number;
  rating_count?: number;
  wallet_balance?: number;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'worker' | 'customer';

export interface Bin {
  id: string;
  owner_id: number;
  owner_name: string;
  latitude: number;
  longitude: number;
  address: string;
  waste_type: WasteType;
  fill_level: number;
  status: BinStatus;
  capacity: number;
  last_collection_date?: string;
  created_at: string;
  updated_at: string;
}

export type WasteType = 'organic' | 'recyclable' | 'general' | 'hazardous';
export type BinStatus = 'empty' | 'partial' | 'full' | 'overflowing' | 'maintenance';

// Dashboard specific types
export interface PickupHistoryItem {
  id: string;
  date: string;
  client: string;
  location: string;
  status: 'completed' | 'cancelled' | 'disputed' | 'paid';
  earnings: number;
  rating?: number;
  notes?: string;
}

export interface DashboardReview {
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

export interface ActivityData {
  date: string;
  pickups: number;
  earnings: number;
  ratings: number;
}

export interface WorkerProfile {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'offline' | 'busy';
  rating: number;
  totalReviews: number;
  completedPickups: number;
  joinDate: string;
  badges: string[];
}

export interface Pickup {
  id: string;
  bin_id: string;
  bin: Bin;
  worker_id?: number;
  worker?: User;
  status: PickupStatus;
  scheduled_time: string;
  completed_time?: string;
  distance: number;
  estimated_time: number;
  actual_time?: number;
  payment_amount: number;
  notes?: string;
  before_photo?: string;
  after_photo?: string;
  created_at: string;
  updated_at: string;
}

export type PickupStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Route {
  id: string;
  worker_id: number;
  pickup_ids: string[];
  status: RouteStatus;
  estimated_duration: number;
  actual_duration?: number;
  total_distance: number;
  created_at: string;
  updated_at: string;
}

export type RouteStatus = 'planned' | 'active' | 'completed';

// ========================================
// Earnings & Payments Types
// ========================================

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
  customer?: string;
  pickup_id?: number;
  reference?: string;
}

export type TransactionType = 'pickup' | 'bonus' | 'withdraw' | 'refund' | 'penalty';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface WithdrawalRequest {
  amount: number;
  method: PaymentMethod;
  details: WithdrawalDetails;
}

export interface WithdrawalDetails {
  phone?: string;
  name?: string;
  account_number?: string;
  bank_name?: string;
}

export type PaymentMethod = 'orange_money' | 'mtn_momo' | 'bank_transfer';

export interface WithdrawalHistory {
  id: number;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: TransactionStatus;
  reference: string;
  processed_date?: string;
}

export interface EarningsData {
  totalBalance: number;
  pendingPayments: number;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  averagePerPickup: number;
  totalPickups: number;
  recentTransactions: Transaction[];
  withdrawalHistory: WithdrawalHistory[];
}

export type EarningsPeriod = 'today' | 'this_week' | 'this_month' | 'all_time';

// ========================================
// Dashboard Types
// ========================================

export interface WorkerStats {
  total_earnings: number;
  pending_pickups: number;
  completed_today: number;
  completed_this_week: number;
  completed_this_month: number;
  avg_rating: number;
  total_distance_today: number;
  active_routes: number;
  total_pickups: number;
  completed_pickups: number;
  rating: number;
  earnings_today: number;
  earnings_week: number;
  earnings_month: number;
  completion_rate: number;
  // Additional properties for enhanced dashboard
  totalEarnings: number;
  activePickups: number;
  completedToday: number;
  averageRating: number;
  totalCompleted: number;
  monthlyEarnings: number;
  weeklyPickups: number;
  completionRate: number;
}

export interface StatCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

// ========================================
// Pickup Types (Worker-specific)
// ========================================

export interface AvailablePickup {
  id: number;
  type: 'organic' | 'recyclable' | 'general' | 'hazardous';
  location: string;
  distance: number;
  reward: number;
  priority: 'low' | 'medium' | 'high';
  timePosted: string;
  estimatedTime: number;
  latitude: number;
  longitude: number;
  customerName: string;
  customerContact?: string;
}

export interface WorkerPickup {
  id: number;
  type: 'organic' | 'recyclable' | 'general' | 'hazardous';
  location: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  customerName: string;
  acceptedAt: string;
  completedAt?: string;
  earnings: number;
  rating?: number;
  customerFeedback?: string;
  estimatedTime: number;
  actualTime?: number;
}

// Task-related types
export interface PickupTask {
  id: number;
  title: string;
  description: string;
  type: 'organic' | 'recyclable' | 'general' | 'hazardous';
  location: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'open' | 'accepted' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  reward: number;
  estimatedTime: number;
  distance: number;
  latitude: number;
  longitude: number;
  customerName: string;
  customerContact?: string;
  scheduledTime: string;
  acceptedAt?: string;
  completedAt?: string;
  created_at?: string;
  // Additional fields used in components
  bin_details?: {
    label?: string;
    address?: string;
    fill_level?: number;
    capacity_liters?: number;
  };
  bin?: string;
  expected_fee?: number;
  payment_method?: string;
  notes?: string;
  bin_latitude?: number;
  bin_longitude?: number;
  bin_address?: string;
  waste_type?: string;
  time_window?: {
    start: string;
    end: string;
  };
}

export interface PickupTaskDetail extends PickupTask {
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  feedback?: string;
  rating?: number;
  payment_status?: string;
}

export interface WorkerEarning {
  id: number;
  amount: number;
  date: string;
  pickupId: number;
  pickupType: string;
  customerName: string;
  location: string;
  status: 'pending' | 'completed';
}

// ========================================
// Message Types
// ========================================

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: 'customer' | 'worker' | 'system';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: number;
  pickupId?: number;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'completed' | 'system';
  messages: Message[];
}

export interface ChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderRole: 'customer' | 'worker' | 'system';
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'system';
}

export interface QuickReply {
  id: string;
  text: string;
  category: 'greeting' | 'status' | 'completion' | 'issue';
}

// ========================================
// Review Types
// ========================================

export interface Review {
  id: number;
  pickupId: number;
  customerName: string;
  rating: number;
  feedback: string;
  date: string;
  pickupType: string;
  location: string;
}

export interface RatingStats {
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

export interface CustomerStats {
  total_bins: number;
  active_bins: number;
  total_pickups: number;
  this_month_pickups: number;
  total_spent: number;
  average_rating_given: number;
  environmental_impact: {
    co2_saved: number;
    waste_diverted: number;
  };
}

export interface AdminStats {
  total_users: number;
  total_workers: number;
  total_customers: number;
  total_bins: number;
  active_bins: number;
  total_pickups: number;
  revenue_this_month: number;
  revenue_today?: number;
  revenue_week?: number;
  avg_response_time: number;
  customer_satisfaction: number;
}

// ========================================
// API Types
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

// ========================================
// Form Types
// ========================================

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: UserRole;
}

export interface BinForm {
  latitude: number;
  longitude: number;
  address: string;
  waste_type: WasteType;
  capacity: number;
}

export interface PickupRequestForm {
  bin_id: string;
  scheduled_time: string;
  notes?: string;
}

// Complete PickupRequest type matching Django model
export interface PickupRequest {
  id: number;
  bin: Bin;
  owner: User;
  worker?: User;
  status: 'open' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  created_at: string;
  accepted_at?: string;
  picked_at?: string;
  completed_at?: string;
  expected_fee: number;
  actual_fee?: number;
  payment_method: 'cash' | 'mobile_money' | 'card';
  payment_status: 'pending' | 'escrowed' | 'paid' | 'refunded' | 'disputed' | 'pending_cash' | 'collected_cash';
  notes?: string;
  cancellation_reason?: string;
  waste_type?: string;
  estimated_weight_kg?: number;
  pickup_time_window_start?: string;
  pickup_time_window_end?: string;
  // Additional computed fields that might be added by serializers
  bin_details?: {
    label?: string;
    address?: string;
    fill_level?: number;
    capacity_liters?: number;
  };
  bin_latitude?: number;
  bin_longitude?: number;
  bin_address?: string;
  customerName?: string;
  location?: string;
}

// Legacy type aliases for backward compatibility
export type LoginCredentials = LoginForm;
export type RegisterData = RegisterForm;
export type BinCreateData = BinForm;
export type PickupCreateData = PickupRequestForm;
export type DashboardStats = CustomerStats;

export interface Payment {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  pickup_id?: number;
  reference?: string;
}

export interface Review {
  id: number;
  pickup_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ReviewCreateData {
  rating: number;
  comment?: string;
}

// ========================================
// Map Types
// ========================================

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface BinLocation extends MapCenter {
  id: string;
  owner_name: string;
  address: string;
  waste_type: WasteType;
  fill_level: number;
  status: BinStatus;
}

export interface MarkerProps {
  position: [number, number];
  icon?: L.Icon | L.DivIcon;
  onClick?: () => void;
  popup?: React.ReactNode;
}

// ========================================
// Component Types
// ========================================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface SelectProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// ========================================
// State Management Types
// ========================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (form: RegisterForm) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
  duration?: number;
  actionUrl?: string;
  actionText?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ========================================
// Utility Types
// ========================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Leaflet types (for map integration)
declare global {
  namespace L {
    interface Icon {}
    interface DivIcon {}
  }
}