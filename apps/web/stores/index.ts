import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Bin, PickupTask, AdminStats, WorkerStats } from '../src/types';

// Export WebSocket store
export * from './websocketStore';

// Auth Store
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    updateUser: (user: Partial<User>) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setLoading: (isLoading) => set({ isLoading }),
            updateUser: (userData) => set((state) => ({
                user: state.user ? { ...state.user, ...userData } : null
            })),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

// Bins Store
interface BinsState {
    bins: Bin[];
    selectedBin: Bin | null;
    isLoading: boolean;
    error: string | null;
    setBins: (bins: Bin[]) => void;
    addBin: (bin: Bin) => void;
    updateBin: (bin: Bin) => void;
    deleteBin: (id: string) => void;
    setSelectedBin: (bin: Bin | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useBinsStore = create<BinsState>((set, get) => ({
    bins: [],
    selectedBin: null,
    isLoading: false,
    error: null,
    setBins: (bins) => set({ bins }),
    addBin: (bin) => set((state) => ({ bins: [...state.bins, bin] })),
    updateBin: (bin) =>
        set((state) => ({
            bins: state.bins.map((b) => (b.id === bin.id ? bin : b)),
            selectedBin: state.selectedBin?.id === bin.id ? bin : state.selectedBin,
        })),
    deleteBin: (id) =>
        set((state) => ({
            bins: state.bins.filter((b) => b.id !== id),
            selectedBin: state.selectedBin?.id === id ? null : state.selectedBin,
        })),
    setSelectedBin: (bin) => set({ selectedBin: bin }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));

// Pickups Store
interface PickupsState {
    pickups: PickupTask[];
    selectedPickup: PickupTask | null;
    isLoading: boolean;
    error: string | null;
    setPickups: (pickups: PickupTask[]) => void;
    addPickup: (pickup: PickupTask) => void;
    updatePickup: (pickup: PickupTask) => void;
    setSelectedPickup: (pickup: PickupTask | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const usePickupsStore = create<PickupsState>((set, get) => ({
    pickups: [],
    selectedPickup: null,
    isLoading: false,
    error: null,
    setPickups: (pickups) => set({ pickups }),
    addPickup: (pickup) => set((state) => ({ pickups: [...state.pickups, pickup] })),
    updatePickup: (pickup) =>
        set((state) => ({
            pickups: state.pickups.map((p) => (p.id === pickup.id ? pickup : p)),
            selectedPickup: state.selectedPickup?.id === pickup.id ? pickup : state.selectedPickup,
        })),
    setSelectedPickup: (pickup) => set({ selectedPickup: pickup }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));

// Dashboard Store
interface DashboardState {
    stats: AdminStats | null;
    workerStats: WorkerStats | null;
    isLoading: boolean;
    error: string | null;
    setStats: (stats: AdminStats) => void;
    setWorkerStats: (stats: WorkerStats) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    workerStats: null,
    isLoading: false,
    error: null,
    setStats: (stats) => set({ stats }),
    setWorkerStats: (workerStats) => set({ workerStats }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));

// UI Store for global UI state
interface UIState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    notifications: any[];
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    addNotification: (notification: any) => void;
    removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            theme: 'light',
            notifications: [],
            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
            setTheme: (theme) => set({ theme }),
            addNotification: (notification) =>
                set((state) => ({ notifications: [...state.notifications, notification] })),
            removeNotification: (id) =>
                set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
        }
    )
);
