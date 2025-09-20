// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'worker' | 'admin';
  phoneNumber?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bin Types
export interface Bin {
  id: string;
  ownerId: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: 'residential' | 'commercial' | 'industrial';
  size: 'small' | 'medium' | 'large';
  status: 'empty' | 'partial' | 'full' | 'overflowing';
  lastPickup?: Date;
  nextPickup?: Date;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pickup Types
export interface Pickup {
  id: string;
  binId: string;
  workerId?: string;
  customerId: string;
  scheduledDate: Date;
  actualPickupDate?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Route Types
export interface Route {
  id: string;
  workerId: string;
  date: Date;
  pickups: Pickup[];
  status: 'planned' | 'in-progress' | 'completed';
  optimizedOrder: string[]; // pickup IDs in order
  estimatedDuration: number; // minutes
  actualDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Worker Types
export interface Worker {
  id: string;
  userId: string;
  vehicleId?: string;
  status: 'available' | 'busy' | 'offline';
  location?: {
    latitude: number;
    longitude: number;
  };
  currentRoute?: string;
  rating: number;
  completedPickups: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface BinForm {
  address: string;
  type: Bin['type'];
  size: Bin['size'];
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface PickupRequestForm {
  binId: string;
  preferredDate: Date;
  priority: Pickup['priority'];
  notes?: string;
}

// Additional API Types
export interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: any;
}

export interface AuthResponse {
  user: User;
  token?: string;
  access?: string;
  refresh?: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: User['role'];
  phoneNumber?: string;
}

export interface BinCreateData {
  address: string;
  type: Bin['type'];
  size: Bin['size'];
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface PickupCreateData {
  binId: string;
  customerId: string;
  scheduledDate: Date;
  priority: Pickup['priority'];
  notes?: string;
}

// Stats Types
export interface WorkerStats {
  completedPickups: number;
  pendingPickups: number;
  earnings: number;
  rating: number;
  hoursWorked: number;
}

export interface CustomerStats {
  totalBins: number;
  totalPickups: number;
  nextPickupDate?: Date;
  monthlySpending: number;
}

export interface AdminStats {
  totalUsers: number;
  totalWorkers: number;
  totalBins: number;
  totalPickups: number;
  completedPickupsToday: number;
  pendingPickups: number;
  revenue: number;
}

export interface DashboardStats {
  worker?: WorkerStats;
  customer?: CustomerStats;
  admin?: AdminStats;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'bank' | 'wallet';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  customerId: string;
  workerId: string;
  pickupId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ReviewCreateData {
  pickupId: string;
  rating: number;
  comment?: string;
}

// Alias for Pickup as PickupRequest for backward compatibility
export type PickupRequest = Pickup;

// Additional Worker Types
export interface PickupTask {
  id: string;
  binId: string;
  workerId?: string;
  scheduledFor: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PickupTaskDetail extends PickupTask {
  bin: Bin;
  customer: User;
  route?: Route;
  estimatedDuration: number;
  distance: number;
}

export interface WorkerEarning {
  id: string;
  workerId: string;
  pickupId: string;
  amount: number;
  date: Date;
  status: 'pending' | 'paid';
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'location';
}

export interface QuickReply {
  id: string;
  text: string;
  category: 'greeting' | 'status' | 'issue' | 'completion';
}