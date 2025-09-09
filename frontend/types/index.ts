// User Types
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'worker' | 'customer';
    phone_number?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
    date_joined: string;
    rating?: number;
    rating_count?: number;
    is_verified: boolean;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    role: 'worker' | 'customer';
    location?: string;
    latitude?: number;
    longitude?: number;
}

// Bin Types - Updated to match backend
export interface Bin {
    id: number;
    bin_id: string;
    label: string;
    owner: string; // StringRelatedField
    latitude: string; // DecimalField as string
    longitude: string;
    address: string;
    status: 'empty' | 'partial' | 'full' | 'pending';
    fill_level: number;
    capacity_liters: number;
    needs_pickup: boolean;
    last_pickup?: string | null;
    created_at: string;
    updated_at: string;
}

export interface BinCreateData {
    bin_id: string;
    label?: string;
    latitude: number;
    longitude: number;
    address?: string;
    capacity_liters?: number;
}

// Pickup Types
// Pickup Types - Updated to match backend
export interface PickupRequest {
    id: number;
    bin: number;
    bin_details?: Bin;
    owner: number;
    owner_details?: string;
    worker?: number | null;
    worker_details?: string | null;
    status: 'open' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
    expected_fee: string;
    actual_fee?: string | null;
    payment_method: 'cash' | 'mobile_money' | 'card';
    payment_status: 'pending' | 'escrowed' | 'paid' | 'refunded' | 'disputed' | 'pending_cash' | 'collected_cash';
    notes?: string;
    cancellation_reason?: string;
    created_at: string;
    accepted_at?: string | null;
    picked_at?: string | null;
    completed_at?: string | null;
    can_be_accepted: boolean;
    can_be_delivered: boolean;
    proofs?: PickupProof[];
}

export interface PickupCreateData {
    bin: number;
    expected_fee?: string;
    payment_method?: 'cash' | 'mobile_money' | 'card';
    notes?: string;
}

// Payment Types
export interface Payment {
    id: number;
    pickup: number;
    customer: User;
    worker?: User;
    amount: string;
    payment_method: 'cash' | 'mobile_money' | 'card';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    escrow_status: 'pending' | 'held' | 'released' | 'refunded';
    transaction_id?: string;
    created_at: string;
    completed_at?: string;
}

// Review Types
export interface Review {
    id: number;
    pickup: PickupRequest;
    reviewer: User;
    reviewee: User;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface ReviewCreateData {
    pickup_id: number;
    rating: number;
    comment?: string;
}

// Analytics Types
export interface DashboardStats {
    total_pickups: number;
    active_bins: number;
    total_workers: number;
    total_customers: number;
    revenue_today: string;
    revenue_week: string;
    revenue_month: string;
}

export interface WorkerStats {
    total_pickups: number;
    completed_pickups: number;
    rating: number;
    earnings_today: string;
    earnings_week: string;
    earnings_month: string;
}

// API Response Types
export interface ApiResponse<T> {
    results: T[];
    count: number;
    next?: string;
    previous?: string;
}

export interface ApiError {
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

// Form Types
export interface FormErrors {
    [key: string]: string;
}

// Notification Types
export interface Notification {
    id: number;
    user: number;
    title: string;
    message: string;
    notification_type: 'pickup_request' | 'pickup_accepted' | 'pickup_completed' | 'payment' | 'review';
    is_read: boolean;
    created_at: string;
    data?: Record<string, any>;
}

// Proof Types
export interface PickupProof {
    id: number;
    pickup: number;
    type: 'before' | 'after';
    image: string;
    image_url: string;
    latitude?: string | null;
    longitude?: string | null;
    captured_by: number;
    captured_by_name?: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    verified_by?: number | null;
    created_at: string;
    verified_at?: string | null;
}
