import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, LocationPicker, RouteDisplay, type RouteData, type Location } from '../../src/design-system/components/MapComponents';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/design-system/components/Card';
import { Heading, Text } from '../../src/design-system/components/Typography';
import { Button, IconButton } from '../../src/design-system/components/Button';
import { Icons } from '../../src/design-system/components/Icons';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import { useToasts } from '../../components/ui/ToastHost';
import PrivateRoute from '../../components/PrivateRoute';

interface JobStop {
  id: string;
  name: string;
  address: string;
  location: Location;
  priority: 'low' | 'medium' | 'high';
  binType: 'household' | 'commercial' | 'industrial';
  status: 'pending' | 'completed' | 'skipped';
}

const mapWasteToBin = (waste: string): JobStop['binType'] => {
  const t = (waste || '').toLowerCase();
  if (t.includes('industrial')) return 'industrial';
  if (t.includes('commercial') || t.includes('office') || t.includes('business')) return 'commercial';
  return 'household';
};

export default function WorkerRoutesPage() {
  const [origin, setOrigin] = useState<Location | undefined>({ lat: 3.8482, lng: 11.5025, address: 'Depot - Yaoundé' });
  const [stops, setStops] = useState<JobStop[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToasts();
  const [stopActionLoading, setStopActionLoading] = useState<Record<string, 'start' | 'complete' | null>>({});

  const fetchStops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await enhancedWorkerDashboardApi.getPendingPickups();
      const mapped: JobStop[] = (data.pending_pickups || []).map((p) => ({
        id: String(p.id),
        name: p.owner_name,
        address: p.location.address,
        location: {
          lat: p.location.latitude ?? 0,
          lng: p.location.longitude ?? 0,
        },
        priority: p.status.includes('urgent') ? 'high' : 'medium',
        binType: mapWasteToBin(p.waste_type),
        status: 'pending',
      }));
      setStops(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load route stops');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    // Restore origin from localStorage if available
    try {
      if (typeof window !== 'undefined') {
        const cached = window.localStorage.getItem('worker_routes_origin');
        if (cached) {
          const parsed = JSON.parse(cached) as Location | undefined;
          if (parsed && parsed.lat && parsed.lng) setOrigin(parsed);
        }
      }
    } catch { /* ignore parse errors */ }

    fetchStops();
    return () => { mounted = false; };
  }, [fetchStops]);

  // Persist origin in localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (origin) {
          window.localStorage.setItem('worker_routes_origin', JSON.stringify(origin));
        } else {
          window.localStorage.removeItem('worker_routes_origin');
        }
      }
    } catch { /* ignore storage errors */ }
  }, [origin]);

  const plannedRoute: RouteData = useMemo(() => {
    const waypoints: Location[] = [
      ...(origin ? [origin] : []),
      ...stops.filter(s => s.status === 'pending').map(s => s.location),
    ];

    return {
      id: 'R-001',
      waypoints,
      distance: Math.max(1, Math.round(waypoints.length * 4.2)),
      duration: Math.max(5, Math.round(waypoints.length * 12.5)),
      status: activeRoute ? activeRoute.status : 'planned',
      color: '#10b981',
    };
  }, [origin, stops, activeRoute]);

  const distanceKm = (a: Location, b: Location) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon));
    return R * c;
  };

  const handleOptimize = () => {
    setIsRouting(true);
    setTimeout(() => {
      // Improve optimization: sort by distance from origin if set, else by latitude
      const optimized = origin
        ? [...stops].sort((a, b) => distanceKm(origin, a.location) - distanceKm(origin, b.location))
        : [...stops].sort((a, b) => a.location.lat - b.location.lat);
      setStops(optimized);
      setActiveRoute({ ...plannedRoute, status: 'planned' });
      setIsRouting(false);
    }, 800);
  };

  const handleStartRoute = () => setActiveRoute({ ...plannedRoute, status: 'active' });
  const handleCompleteRoute = () => setActiveRoute(prev => (prev ? { ...prev, status: 'completed' } : plannedRoute));

  const handleStartStop = async (id: string) => {
    const pickupId = Number(id);
    setStopActionLoading(prev => ({ ...prev, [id]: 'start' }));
    try {
      await enhancedWorkerDashboardApi.startPickup(pickupId);
      push({ type: 'success', message: 'Pickup started' });
      // No status change needed visually, keep as pending until completion
    } catch (e: any) {
      push({ type: 'error', message: e?.message || 'Failed to start pickup' });
    } finally {
      setStopActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleCompleteStop = async (id: string) => {
    const pickupId = Number(id);
    // optimistic UI: mark completed
    const prevStops = stops;
    setStopActionLoading(prev => ({ ...prev, [id]: 'complete' }));
    setStops(prev => prev.map(s => (s.id === id ? { ...s, status: 'completed' } : s)));
    try {
      await enhancedWorkerDashboardApi.completePickup(pickupId, {});
      push({ type: 'success', message: 'Pickup completed' });
      // Optionally refetch to stay in sync
      fetchStops();
    } catch (e: any) {
      // rollback
      setStops(prevStops);
      push({ type: 'error', message: e?.message || 'Failed to complete pickup' });
    } finally {
      setStopActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  return (
    <PrivateRoute requiredRole="worker">
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Heading level={1} className="mb-1 text-neutral-900 dark:text-neutral-100">Routes</Heading>
          <Text variant="body" className="text-neutral-600 dark:text-neutral-300">Plan and execute your pickup route efficiently</Text>
        </div>

        {/* Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Route Map</CardTitle>
                <CardDescription>Overview of your planned route and stops</CardDescription>
              </CardHeader>
              <CardContent>
                <MapContainer size="xl" className="h-[420px] rounded-lg" routes={activeRoute ? [activeRoute] : [plannedRoute]} showControls>
                  {/* overlay content if needed */}
                </MapContainer>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleOptimize} loading={isRouting} leftIcon={<Icons.Settings className="h-4 w-4" />}>Optimize</Button>
                  <Button variant="secondary" onClick={() => setOrigin(undefined)} leftIcon={<Icons.Home className="h-4 w-4" />}>Clear Origin</Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="primary" onClick={handleStartRoute} disabled={activeRoute?.status === 'active'} leftIcon={<Icons.PlayCircle className="h-4 w-4" />}>Start</Button>
                  <Button variant="success" onClick={handleCompleteRoute} disabled={!activeRoute || activeRoute.status !== 'active'} leftIcon={<Icons.CheckCircle className="h-4 w-4" />}>Complete</Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origin</CardTitle>
                <CardDescription>Choose a starting point for your route</CardDescription>
              </CardHeader>
              <CardContent>
                <LocationPicker value={origin} onChange={setOrigin} placeholder="Search depot or current location..." />
              </CardContent>
            </Card>
          </div>

          {/* Stops sidebar */}
          <div className="space-y-4">
            {error && (
              <Card>
                <CardContent>
                  <Text variant="body" className="text-red-600 dark:text-red-400">{error}</Text>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card>
                <CardContent>
                  <Text variant="body" className="text-neutral-600 dark:text-neutral-300">Loading stops...</Text>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Route Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Text variant="caption" className="text-neutral-500">Stops</Text>
                    <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{stops.filter(s => s.status === 'pending').length}</div>
                  </div>
                  <div>
                    <Text variant="caption" className="text-neutral-500">Distance</Text>
                    <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{plannedRoute.distance} km</div>
                  </div>
                  <div>
                    <Text variant="caption" className="text-neutral-500">ETA</Text>
                    <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{plannedRoute.duration} min</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stops</CardTitle>
                <CardDescription>Tap a stop to mark as complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {!loading && stops.length === 0 && (
                    <div className="p-3 rounded-md border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-center">
                      <Text variant="body" className="text-neutral-600 dark:text-neutral-400">No pending stops</Text>
                    </div>
                  )}
                  {stops.map((s) => (
                    <div key={s.id} className={`p-3 rounded-md border flex items-start gap-3 ${s.status === 'completed' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'}`}>
                      <div className="h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: s.status === 'completed' ? '#10b981' : '#6b7280' }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Text variant="label" className="text-neutral-900 dark:text-neutral-100">{s.name}</Text>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${s.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' : s.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'}`}>{s.priority}</span>
                        </div>
                        <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">{s.address}</Text>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartStop(s.id)}
                            leftIcon={<Icons.PlayCircle className="h-4 w-4" />}
                            loading={stopActionLoading[s.id] === 'start'}
                            disabled={s.status === 'completed'}
                          >Start</Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCompleteStop(s.id)}
                            leftIcon={<Icons.CheckCircle className="h-4 w-4" />}
                            loading={stopActionLoading[s.id] === 'complete'}
                            disabled={s.status === 'completed'}
                          >Complete</Button>
                          <Button variant="outline" size="sm" leftIcon={<Icons.MapPin className="h-4 w-4" />} onClick={() => window.open(`https://www.google.com/maps?q=${s.location.lat},${s.location.lng}`, '_blank', 'noopener,noreferrer')}>Navigate</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent>
                <RouteDisplay route={activeRoute || plannedRoute} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </PrivateRoute>
  );
}
