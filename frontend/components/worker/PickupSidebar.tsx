import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';

interface BasePickup {
  id: number;
  owner_name?: string;
  location?: any;
  address?: string;
  status: string;
  created_at?: string;
  waste_type?: string;
  estimated_earnings?: number;
}

interface PickupSidebarProps {
  onSelectPickup?: (pickup: BasePickup) => void;
  activePickupId?: number | null;
  workerLocation?: { latitude: number; longitude: number };
  onPickupsUpdate?: (data: { pending: BasePickup[]; available: BasePickup[]; completed: BasePickup[] }) => void;
}

const tabDefs = [
  { key: 'pending', label: 'Pending' },
  { key: 'available', label: 'Available' },
  { key: 'completed', label: 'Completed' }
] as const;

type TabKey = (typeof tabDefs)[number]['key'];

const PickupSidebar: React.FC<PickupSidebarProps> = ({ onSelectPickup, activePickupId, workerLocation, onPickupsUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<BasePickup[]>([]);
  const [available, setAvailable] = useState<BasePickup[]>([]);
  const [completed, setCompleted] = useState<BasePickup[]>([]);
  const [sort, setSort] = useState<'distance' | 'recent'>('distance');
  const [statusFilters, setStatusFilters] = useState<string[]>([]); // empty => all
  const [wasteFilters, setWasteFilters] = useState<string[]>([]); // derived from data
  const [distanceBucket, setDistanceBucket] = useState<string | null>(null); // '<2','2-5','5-10','>10'

  useEffect(() => {
    // Restore persisted filter state
    try {
      const raw = localStorage.getItem('kly_worker_filters_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.sort) setSort(parsed.sort);
        if (Array.isArray(parsed.status)) setStatusFilters(parsed.status);
        if (Array.isArray(parsed.waste)) setWasteFilters(parsed.waste);
        if (parsed.distanceBucket) setDistanceBucket(parsed.distanceBucket);
      }
    } catch {}
    load();
    // Polling interval
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load();
      }
    }, 60000); // 60s
    return () => clearInterval(interval);
  }, []);

  // Persist whenever filters change
  useEffect(() => {
    try {
      localStorage.setItem('kly_worker_filters_v1', JSON.stringify({
        sort,
        status: statusFilters,
        waste: wasteFilters,
        distanceBucket,
      }));
    } catch {}
  }, [sort, statusFilters, wasteFilters, distanceBucket]);

  // Emit updates upward when data changes
  useEffect(() => {
    if (onPickupsUpdate) {
      onPickupsUpdate({ pending, available, completed });
    }
  }, [pending, available, completed, onPickupsUpdate]);

  const load = async () => {
    try {
      setLoading(true);
      const [pendingRes, availableRes, completedRes] = await Promise.all([
        enhancedWorkerDashboardApi.getPendingPickups(),
        enhancedWorkerDashboardApi.getAvailablePickups(),
        enhancedWorkerDashboardApi.getCompletedPickups(),
      ]);
      setPending(pendingRes.data.pending_pickups || []);
      setAvailable((availableRes.data.available_pickups || []).map((p: any) => ({ ...p, status: 'available' })));
      setCompleted((completedRes.data.completed_pickups || []).map((p: any) => ({ ...p, status: 'completed' })));
    } catch (e) {
      console.error('Failed loading pickups', e);
    } finally {
      setLoading(false);
    }
  };

  const calcDistance = (p: any) => {
    if (!workerLocation || !p.location || !p.location.latitude || !p.location.longitude) return undefined;
    const { latitude, longitude } = workerLocation;
    const lat1 = latitude * Math.PI/180; const lat2 = p.location.latitude * Math.PI/180;
    const dLat = (p.location.latitude - latitude) * Math.PI/180;
    const dLon = (p.location.longitude - longitude) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return 6371 * c; // km
  };

  const dataMap: Record<TabKey, BasePickup[]> = { pending, available, completed };

  // When activePickupId changes, ensure the correct tab is selected & scroll into view
  useEffect(() => {
    if (!activePickupId) return;
    // Determine which collection contains it
    const foundIn: TabKey | undefined = (['pending','available','completed'] as TabKey[]).find(k => (dataMap[k] || []).some(p => p.id === activePickupId)) as TabKey | undefined;
    if (foundIn && foundIn !== activeTab) setActiveTab(foundIn);
    // Delay scroll to allow list render
    const timeout = setTimeout(() => {
      const el = document.querySelector(`[data-pickup-id='pickup-${activePickupId}']`);
      if (el && 'scrollIntoView' in el) {
        (el as HTMLElement).scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 80);
    return () => clearTimeout(timeout);
  }, [activePickupId, activeTab, dataMap]);

  const filtered = useMemo(() => {
    const list = dataMap[activeTab] || [];
    const searched = search
      ? list.filter(p => (p.owner_name || '').toLowerCase().includes(search.toLowerCase()) || (p.address || p.location?.address || '').toLowerCase().includes(search.toLowerCase()))
      : list;
    const augmented = searched.map(p => ({ ...p, _distance: calcDistance(p) }));
    const statusFiltered = statusFilters.length ? augmented.filter(p => statusFilters.includes(p.status)) : augmented;
    const wasteFiltered = wasteFilters.length ? statusFiltered.filter(p => wasteFilters.includes((p as any).waste_type)) : statusFiltered;
    const distanceFiltered = distanceBucket ? wasteFiltered.filter(p => {
      const d = (p as any)._distance;
      if (d == null) return false;
      switch (distanceBucket) {
        case '<2': return d < 2;
        case '2-5': return d >= 2 && d < 5;
        case '5-10': return d >= 5 && d < 10;
        case '>10': return d >= 10;
        default: return true;
      }
    }) : wasteFiltered;
    return distanceFiltered.sort((a: any, b: any) => {
      if (sort === 'distance') {
        if (a._distance == null) return 1;
        if (b._distance == null) return -1;
        return a._distance - b._distance;
      }
      return (new Date(b.created_at || '').getTime()) - (new Date(a.created_at || '').getTime());
    });
  }, [activeTab, dataMap, search, sort, workerLocation, statusFilters, wasteFilters, distanceBucket]);

  const uniqueWasteTypes = useMemo(() => {
    const all = [...pending, ...available, ...completed].map(p => (p as any).waste_type).filter(Boolean);
    return Array.from(new Set(all)).slice(0, 12); // limit
  }, [pending, available, completed]);

  const toggleStatus = (s: string) => {
    setStatusFilters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  const toggleWaste = (w: string) => {
    setWasteFilters(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);
  };
  const setDistance = (b: string | null) => setDistanceBucket(prev => prev === b ? null : b);

  const statusPill = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand / Top Bar */}
      <div className="px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-lg">Klynaa</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Worker</span>
          </div>
          <button onClick={load} className="text-xs text-gray-500 hover:text-gray-700">↻ Refresh</button>
        </div>
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pickups or customers"
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto hide-scrollbar">
        {tabDefs.map(t => {
          const active = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${active ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
              {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-green-600" />}
            </button>
          );
        })}
      </div>

      {/* Sort / Filters */}
      <div className="px-4 py-3 flex flex-col gap-3 border-b bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Sort:</span>
            <button
              onClick={() => setSort('distance')}
              className={`px-2 py-1 rounded-md border text-xs ${sort==='distance' ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 hover:bg-gray-100'}`}
            >Distance</button>
            <button
              onClick={() => setSort('recent')}
              className={`px-2 py-1 rounded-md border text-xs ${sort==='recent' ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 hover:bg-gray-100'}`}
            >Recent</button>
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">{filtered.length} items</div>
        </div>
        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {['pending','accepted','in_progress','completed'].map(s => {
            const active = statusFilters.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={`px-2 py-1 rounded-full text-[11px] border transition ${active ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >{s.replace('_',' ')}</button>
            );
          })}
          {statusFilters.length > 0 && (
            <button onClick={() => setStatusFilters([])} className="px-2 py-1 rounded-full text-[11px] bg-gray-100 text-gray-500 hover:bg-gray-200">Clear</button>
          )}
        </div>
        {/* Distance buckets */}
        {workerLocation && (
          <div className="flex flex-wrap gap-2">
            {['<2','2-5','5-10','>10'].map(b => {
              const active = distanceBucket === b;
              return (
                <button
                  key={b}
                  onClick={() => setDistance(b)}
                  className={`px-2 py-1 rounded-full text-[11px] border transition ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >{b} km</button>
              );
            })}
            {distanceBucket && (
              <button onClick={() => setDistance(null)} className="px-2 py-1 rounded-full text-[11px] bg-gray-100 text-gray-500 hover:bg-gray-200">Any dist.</button>
            )}
          </div>
        )}
        {/* Waste type chips */}
        {uniqueWasteTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueWasteTypes.map(w => {
              const active = wasteFilters.includes(w);
              return (
                <button
                  key={w}
                  onClick={() => toggleWaste(w)}
                  className={`px-2 py-1 rounded-full text-[11px] border transition ${active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >{w}</button>
              );
            })}
            {wasteFilters.length > 0 && (
              <button onClick={() => setWasteFilters([])} className="px-2 py-1 rounded-full text-[11px] bg-gray-100 text-gray-500 hover:bg-gray-200">Clear</button>
            )}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-sm text-gray-500">Loading pickups…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">No pickups found</div>
        )}
        <ul className="divide-y">
          {filtered.map(p => (
            <li
              key={p.id}
              onClick={() => onSelectPickup?.(p)}
              data-pickup-id={`pickup-${p.id}`}
              className={`cursor-pointer group px-5 py-4 text-sm hover:bg-green-50/70 transition relative ${activePickupId === p.id ? 'bg-green-50/80 ring-1 ring-green-400' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-gray-800 flex-1 pr-2 truncate">{p.owner_name || 'Customer'}</div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusPill(p.status)}`}>{p.status.replace('_',' ')}</div>
              </div>
              <div className="text-xs text-gray-500 truncate mb-2">{p.location?.address || p.address || 'Address unavailable'}</div>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <span>📦</span>
                  {p.waste_type || 'Waste'}
                </span>
                <span className="flex items-center gap-1">
                  <span>💰</span>
                  {p.estimated_earnings ? `${p.estimated_earnings} XAF` : '—'}
                </span>
              </div>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-gray-500">›</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer stats placeholder */}
      <div className="hidden md:grid grid-cols-3 gap-3 p-4 border-t bg-white/70 backdrop-blur text-[11px]">
        <div className="p-2 rounded-lg bg-gray-50">
          <div className="text-gray-400">Active</div>
          <div className="font-semibold text-gray-800">{pending.length}</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50">
          <div className="text-gray-400">Available</div>
          <div className="font-semibold text-gray-800">{available.length}</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50">
          <div className="text-gray-400">Completed</div>
          <div className="font-semibold text-gray-800">{completed.length}</div>
        </div>
      </div>
    </div>
  );
};

export default PickupSidebar;
