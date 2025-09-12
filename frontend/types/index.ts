// User Types
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'worker' | 'customer';
    phone_number?: string;
    is_verified: boolean;
    latitude?: number;
    longitude?: number;
    rating_average?: number;
    rating_count?: number;
    wallet_balance?: number;
    is_available?: boolean;
    pending_pickups_count?: number;
    service_radius_km?: number;
    date_joined: string;
    last_login?: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface LoginCredentials {
    email?: string;
    username?: string;
    password: string;
}

export interface RegisterData {
    username: string;
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

// Worker Dashboard Types
export interface WorkerStats {
    total_pickups: number;
    completed_today: number;
    completed_this_week: number;
    completion_rate: number;
    average_rating: number;
    total_earnings: string;
    pending_earnings: string;
    today_earnings: string;
    current_status: 'ACTIVE' | 'OFFLINE';
    active_pickups: number;
    available_pickups_nearby: number;
}

export interface PickupTask {
    id: string;
    status: 'open' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
    waste_type: string;
    estimated_weight_kg?: number;
    expected_fee: string;
    owner_name: string;
    owner_phone: string;
    bin_address: string;
    bin_latitude: number;
    bin_longitude: number;
    distance_km: number;
    can_accept: boolean;
    time_window?: {
        start: string;
        end: string;
    };
    notes?: string;
    created_at: string;
    accepted_at?: string;
    picked_at?: string;
    completed_at?: string;
}

export interface PickupTaskDetail extends PickupTask {
    chat_room_id?: string;
    proofs: PickupProof[];
}

export interface PickupProof {
    id: number;
    type: 'pickup' | 'dropoff' | 'before' | 'after';
    image_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface WorkerEarning {
    id: number;
    pickup_id: string;
    pickup_date: string;
    owner_name: string;
    base_amount: string;
    bonus_amount: string;
    platform_fee: string;
    net_amount: string;
    status: 'pending' | 'paid' | 'held' | 'disputed';
    payout_method: string;
    payout_reference?: string;
    earned_at: string;
    paid_at?: string;
}

export interface ChatMessage {
    message_id: string;
    message_type: 'text' | 'image' | 'quick_reply' | 'system' | 'status_update';
    content: string;
    image?: string;
    sender_name: string;
    is_own_message: boolean;
    is_read: boolean;
    created_at: string;
    client_message_id?: string;
}

export interface QuickReply {
    id: number;
    text: string;
    category: string;
    usage_count: number;
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

// Chat Types
export interface ChatRoom {
    id: string;
    pickup: PickupTask;
    worker: User;
    customer: User;
    created_at: string;
    last_message_at?: string;
}

export interface ChatMessage {
    id: string;
    room: ChatRoom;
    sender: User;
    message: string;
    message_type: 'text' | 'image' | 'quick_reply' | 'system' | 'status_update';
    image?: string;
    is_read: boolean;
    created_at: string;
}

export interface SendMessageData {
    content: string;
    message_type?: 'text' | 'quick_reply';
    client_message_id?: string;
    image?: File;
}

// Proof Types - Unified with Worker Dashboard
