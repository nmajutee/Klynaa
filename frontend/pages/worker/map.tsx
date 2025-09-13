import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import PrivateRoute from '../../components/PrivateRoute';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PickupSidebar from '../../components/worker/PickupSidebar';
import dynamic from 'next/dynamic';

const WorkerMap = dynamic(() => import('../../components/WorkerMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse" />
});
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import { usePickupUpdates } from '../../hooks/usePickupUpdates';
// import { ToastHost, useToasts } from '../../components/ui/ToastHost';

interface UnifiedPickup {
  id: number;
  owner_name?: string;
  customer_name?: string;
  status: string;
  location?: { address?: string; latitude?: number | null; longitude?: number | null };
  address?: string;
  waste_type?: string;
  estimated_weight?: number | null;
  expected_fee?: number;
  created_at?: string;
  phone?: string;
}

interface WorkerStatus {
  status: 'active' | 'offline' | 'verification_required' | 'disabled';
  color: string;
  label: string;
}

interface OverviewCard {
  value: number;
  currency?: string;
  formatted: string;
  icon: string;
  color: string;
  label?: string;
  total_reviews?: number;
}

interface DashboardData {
  profile: {
    id: number;
    name: string;
    profile_picture: string | null;
    status: WorkerStatus;
    location: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  overview_cards: {
    total_earnings: OverviewCard;
    pending_pickups: OverviewCard;
    completed_pickups: OverviewCard;
    average_rating: OverviewCard;
  };
  quick_stats: {
    completed_today: number;
    completed_this_week: number;
    completed_this_month: number;
  };
}

const WorkerMapPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [allPickups, setAllPickups] = useState<{ pending: UnifiedPickup[]; available: UnifiedPickup[]; completed: UnifiedPickup[]}>({ pending: [], available: [], completed: [] });
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);
  const [workerLocation, setWorkerLocation] = useState<{ latitude: number; longitude: number } | undefined>();

  const loadDashboardData = async () => {
    try {
      const response = await enhancedWorkerDashboardApi.getOverview();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      await enhancedWorkerDashboardApi.updateStatus({ is_available: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  // const { push: pushToast } = useToasts();
  // Placeholder token retrieval; adjust if auth stored differently
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Restore selected pickup id
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('kly_last_pickup');
    if (saved) {
      const id = parseInt(saved, 10);
      if (!isNaN(id)) setSelectedPickupId(id);
    }
  }, []);
  React.useEffect(() => {
    if (selectedPickupId != null) localStorage.setItem('kly_last_pickup', String(selectedPickupId));
  }, [selectedPickupId]);

  const classify = (pickup: any) => {
    const status = pickup.status;
    if (['completed'].includes(status)) return 'completed';
    if (['accepted','in_progress','pending'].includes(status)) return 'pending';
    return 'available';
  };
  // Buffer events for batching
  const eventBuffer = React.useRef<{created:any[]; updated:any[]; deleted:number[]}>({created:[],updated:[],deleted:[]});
  const flushTimeout = React.useRef<any>(null);
  const flushEvents = () => {
    const { created, updated, deleted } = eventBuffer.current;
    if (!created.length && !updated.length && !deleted.length) return;

    // Emit toasts for events
    // created.forEach(p => pushToast({ message: `New pickup #${p.id} available`, type: 'success' }));
    // updated.forEach(p => pushToast({ message: `Pickup #${p.id} updated`, type: 'info' }));
    // deleted.forEach(id => pushToast({ message: `Pickup #${id} removed`, type: 'error' }));

    setAllPickups(prev => {
      let next = { ...prev };
      // Handle deletions first
      if (deleted.length) {
        next = {
          pending: next.pending.filter(p => !deleted.includes(p.id)),
          available: next.available.filter(p => !deleted.includes(p.id)),
          completed: next.completed.filter(p => !deleted.includes(p.id)),
        };
      }
      const strip = (arr: any[], id: number) => arr.filter(p => p.id !== id);
      // Apply updates (including creates treated similarly)
      const allUpdated = [...updated, ...created];
      for (const pk of allUpdated) {
        const bucket = classify(pk);
        next = {
          pending: bucket==='pending' ? [pk, ...strip(next.pending, pk.id)] : strip(next.pending, pk.id),
          available: bucket==='available' ? [pk, ...strip(next.available, pk.id)] : strip(next.available, pk.id),
          completed: bucket==='completed' ? [pk, ...strip(next.completed, pk.id)] : strip(next.completed, pk.id),
        };
      }
      return next;
    });
    eventBuffer.current = { created:[], updated:[], deleted:[] };
    setLastSync(Date.now());
  };
  const scheduleFlush = () => {
    if (flushTimeout.current) return; // already scheduled
    flushTimeout.current = setTimeout(() => {
      flushTimeout.current = null;
      flushEvents();
    }, 500);
  };

  const { connected: liveConnected } = usePickupUpdates({
    token,
    enabled: true,
    path: '/ws/pickups/',
    onCreated: (pickup) => { eventBuffer.current.created.push(pickup); scheduleFlush(); },
    onUpdated: (pickup) => { eventBuffer.current.updated.push(pickup); scheduleFlush(); },
    onDeleted: (id) => { eventBuffer.current.deleted.push(id); scheduleFlush(); }
  });

  // Update last sync when connection established or data mutated
  React.useEffect(() => { if (liveConnected) setLastSync(Date.now()); }, [liveConnected]);
  React.useEffect(() => { const t = setInterval(() => { if(lastSync) setLastSync(v=>v? v : null); }, 15000); return () => clearInterval(t); }, [lastSync]);

  const freshnessLabel = React.useMemo(() => {
    if (!lastSync) return '—';
    const diff = Date.now() - lastSync;
    if (diff < 15000) return 'just now';
    if (diff < 30000) return '30s';
    if (diff < 60000) return '1m';
    const mins = Math.floor(diff/60000);
    return `${mins}m`;
  }, [lastSync]);
  const isStale = lastSync ? (Date.now() - lastSync) > 60000 : false;

  const handlePickupsUpdate = (data: { pending: UnifiedPickup[]; available: UnifiedPickup[]; completed: UnifiedPickup[] }) => {
    setAllPickups(data);
    setLastSync(Date.now());
  };

  const unifiedForMap = useMemo(() => {
    const combine = [...allPickups.pending, ...allPickups.available];
    return combine
      .filter(p => {
        const lat = p.location?.latitude; const lng = p.location?.longitude;
        return typeof lat === 'number' && typeof lng === 'number';
      })
      .map(p => ({
        id: p.id,
        title: `Pickup #${p.id}`,
        latitude: p.location!.latitude as number,
        longitude: p.location!.longitude as number,
        status: (p.status as any) || 'pending',
        address: p.location?.address || p.address || 'Unknown address',
        customer_name: p.owner_name || p.customer_name || 'Customer',
        phone: p.phone,
        waste_type: p.waste_type || 'Waste'
      }));
  }, [allPickups]);

  const doRefresh = async () => {
    setRefreshing(true);
    try {
      // Leverage sidebar refresh button indirectly by calling its API here if needed in future.
      // For now sidebar owns data loading; this just toggles a state so user feedback could be shown.
      setTimeout(() => setRefreshing(false), 800);
    } catch {
      setRefreshing(false);
    }
  };

  const handleLocationUpdate = async (lat: number, lng: number) => {
    setWorkerLocation({ latitude: lat, longitude: lng });
    try { await enhancedWorkerDashboardApi.updateStatus({ latitude: lat, longitude: lng }); } catch (e) { console.warn('Failed updating worker location', e); }
  };

  return (
    <PrivateRoute requiredRole="worker">
      <Head>
        <title>Pickup Map - Klynaa Worker</title>
        <meta name="description" content="Interactive map showing pickup locations" />
      </Head>
      {/* <ToastHost> */}
        <WorkerLayout
          sidebar={<PickupSidebar
            onSelectPickup={(p:any)=> setSelectedPickupId(p.id)}
            activePickupId={selectedPickupId}
            onPickupsUpdate={handlePickupsUpdate}
            workerLocation={workerLocation}
            dashboardData={dashboardData}
            isAvailable={isAvailable}
            toggleAvailability={toggleAvailability}
          />}
        >
        <div className="h-full relative">
          <WorkerMap
            pickups={unifiedForMap as any}
            workerLocation={workerLocation}
            selectedPickupId={selectedPickupId}
            onPickupSelect={(p)=> setSelectedPickupId(p.id)}
            onLocationUpdate={handleLocationUpdate}
            className="h-full"
          />
          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow px-3 py-2 text-[11px] space-y-1 border">
            <div className="font-semibold text-gray-700 text-xs mb-1">Legend</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#EF4444'}}></span><span>Pending</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#F59E0B'}}></span><span>Accepted</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#3B82F6'}}></span><span>In Progress</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#10B981'}}></span><span>Completed</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:'#9333EA'}}></span><span>Problematic</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full ring-2 ring-blue-400" style={{background:'#2563EB'}}></span><span>Selected</span></div>
          </div>
          {liveConnected && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="px-2 py-1 rounded-full bg-green-600 text-white text-[10px] font-semibold shadow">LIVE</span>
            </div>
          )}
          <button
            onClick={doRefresh}
            disabled={refreshing}
            className={`absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg border hover:shadow-xl transition-shadow ${refreshing ? 'opacity-50 cursor-wait' : ''}`}
            title="Refresh"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {workerLocation && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-2 shadow-lg border text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Your Location</span>
              </div>
              <div className="text-gray-500 mt-1">
                {workerLocation.latitude.toFixed(4)}, {workerLocation.longitude.toFixed(4)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isStale ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>sync {freshnessLabel}</span>
                {isStale && <button onClick={doRefresh} className="text-[10px] text-blue-600 underline">refresh</button>}
              </div>
            </div>
          )}
        </div>
        </WorkerLayout>
      {/* </ToastHost> */}
    </PrivateRoute>
  );
};

export default WorkerMapPage;