import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useAuthStore } from '../../stores';
import PrivateRoute from '../../components/PrivateRoute';
import {
  UserIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CircleStackIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
  PlayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
  CircleStackIcon as CircleStackIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';

const WorkerMap = dynamic(() => import('../../components/WorkerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface WorkerStats {
  total_earnings: number;
  pending_pickups: number;
  completed_today: number;
  avg_rating: number;
}

interface Bin {
  id: string;
  lat: number;
  lng: number;
  address: string;
  waste_type: 'general' | 'recyclable' | 'green' | 'hazardous';
  status: 'available' | 'full' | 'reported' | 'collected';
  fill_level: number;
  owner_name: string;
  distance?: number;
  last_reported_at: string;
}

interface Pickup {
  id: string;
  bin_id: string;
  bin: Bin;
  status: 'pending' | 'accepted' | 'in_progress' | 'collected' | 'dropped' | 'cancelled';
  scheduled_time: string;
  proof_photo_url?: string;
  amount?: number;
  distance?: number;
}

const WorkerDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const [stats, setStats] = useState<WorkerStats>({
    total_earnings: 125600,
    pending_pickups: 12,
    completed_today: 8,
    avg_rating: 4.8
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [wasteTypeFilter, setWasteTypeFilter] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'bins' | 'accepted' | 'completed' | 'history'>('bins');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);

  // Mock data initialization
  useEffect(() => {
    // Mock bins data
    setBins([
      {
        id: '1',
        lat: 4.0511,
        lng: 9.7679,
        address: 'Mboppi Market, Douala',
        waste_type: 'general',
        status: 'full',
        fill_level: 92,
        owner_name: 'Market Authority',
        distance: 1.2,
        last_reported_at: '2025-09-13T08:30:00Z'
      },
      {
        id: '2',
        lat: 4.0489,
        lng: 9.7701,
        address: 'Akwa Palace Hotel',
        waste_type: 'recyclable',
        status: 'full',
        fill_level: 78,
        owner_name: 'Hotel Management',
        distance: 2.1,
        last_reported_at: '2025-09-13T09:15:00Z'
      },
      {
        id: '3',
        lat: 4.0520,
        lng: 9.7650,
        address: 'Bonanjo Shopping Center',
        waste_type: 'general',
        status: 'full',
        fill_level: 85,
        owner_name: 'Mall Management',
        distance: 0.8,
        last_reported_at: '2025-09-13T07:45:00Z'
      }
    ]);

    // Mock pickups data
    setPickups([
      {
        id: 'p1',
        bin_id: '1',
        bin: {
          id: '1',
          lat: 4.0511,
          lng: 9.7679,
          address: 'Mboppi Market, Douala',
          waste_type: 'general',
          status: 'full',
          fill_level: 92,
          owner_name: 'Market Authority',
          distance: 1.2,
          last_reported_at: '2025-09-13T08:30:00Z'
        },
        status: 'pending',
        scheduled_time: '2025-09-13T10:00:00Z',
        distance: 1.2
      },
      {
        id: 'p2',
        bin_id: '2',
        bin: {
          id: '2',
          lat: 4.0489,
          lng: 9.7701,
          address: 'Akwa Palace Hotel',
          waste_type: 'recyclable',
          status: 'full',
          fill_level: 78,
          owner_name: 'Hotel Management',
          distance: 2.1,
          last_reported_at: '2025-09-13T09:15:00Z'
        },
        status: 'pending',
        scheduled_time: '2025-09-13T11:00:00Z',
        distance: 2.1
      },
      {
        id: 'p3',
        bin_id: '3',
        bin: {
          id: '3',
          lat: 4.0520,
          lng: 9.7650,
          address: 'Bonanjo Shopping Center',
          waste_type: 'general',
          status: 'full',
          fill_level: 85,
          owner_name: 'Mall Management',
          distance: 0.8,
          last_reported_at: '2025-09-13T07:45:00Z'
        },
        status: 'accepted',
        scheduled_time: '2025-09-13T09:30:00Z',
        distance: 0.8
      }
    ]);
  }, []);

  // Filter and search logic
  const filteredPickups = pickups.filter(pickup => {
    const matchesWasteType = wasteTypeFilter === 'all' || pickup.bin.waste_type === wasteTypeFilter;
    const matchesDistance = distanceFilter === 'all' ||
      (distanceFilter === '1' && pickup.distance! <= 1) ||
      (distanceFilter === '3' && pickup.distance! <= 3) ||
      (distanceFilter === '5' && pickup.distance! <= 5) ||
      (distanceFilter === '10' && pickup.distance! <= 10);
    const matchesSearch = searchQuery === '' ||
      pickup.bin.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.bin.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesWasteType && matchesDistance && matchesSearch;
  });

  // Event handlers
  const handleAcceptPickup = useCallback((pickupId: string) => {
    setPickups(prev => prev.map(p =>
      p.id === pickupId ? { ...p, status: 'accepted' as const } : p
    ));
    console.log('Accepting pickup:', pickupId);
  }, []);

  const handleStartRoute = useCallback((pickupId: string) => {
    console.log('Starting route for pickup:', pickupId);
  }, []);

  const handleReportIssue = useCallback((pickupId: string) => {
    console.log('Reporting issue for pickup:', pickupId);
  }, []);

  const handleBinSelect = useCallback((pickup: any) => {
    setSelectedBin(pickup.id);
  }, []);

  // Task Item Component
  const TaskItem = ({ pickup, isExpanded, onToggleExpand, onAccept, onStartRoute, onReportIssue }: {
    pickup: Pickup;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onAccept: () => void;
    onStartRoute: () => void;
    onReportIssue: () => void;
  }) => (
    <div className="klynaa-card mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between" onClick={onToggleExpand}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="klynaa-h2 text-gray-900">{pickup.bin.owner_name}</span>
            <span className="klynaa-caption text-gray-500">• {pickup.distance}km</span>
          </div>
          <div className="klynaa-body text-gray-600 mb-2">{pickup.bin.address}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`waste-tag ${pickup.bin.waste_type}`}>
              {pickup.bin.waste_type}
            </span>
            <span className="klynaa-caption">~{pickup.bin.fill_level}kg</span>
          </div>
          <div className={`status-pill ${pickup.status}`}>
            {pickup.status.replace('_', ' ')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2 mb-3">
            {pickup.status === 'pending' && (
              <button
                className="klynaa-btn-primary text-sm"
                onClick={(e) => { e.stopPropagation(); onAccept(); }}
              >
                Accept
              </button>
            )}
            {pickup.status === 'accepted' && (
              <button
                className="klynaa-btn-secondary text-sm"
                onClick={(e) => { e.stopPropagation(); onStartRoute(); }}
              >
                <PlayIcon className="w-4 h-4" />
                Start Route
              </button>
            )}
            <button
              className="klynaa-btn-danger text-sm"
              onClick={(e) => { e.stopPropagation(); onReportIssue(); }}
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              Report Issue
            </button>
          </div>
          <div className="klynaa-caption">
            <div>Scheduled: {new Date(pickup.scheduled_time).toLocaleString()}</div>
            <div>Fill Level: {pickup.bin.fill_level}%</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PrivateRoute requiredRole="worker">
      <Head>
        <title>Worker Dashboard - Klynaa</title>
      </Head>

      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="klynaa-h2 text-gray-900">{user ? `${user.first_name} ${user.last_name}` : 'Worker'}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="klynaa-caption text-green-600">Active</span>
                </div>
              </div>
              <button className="lg:hidden p-2">
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by owner or address..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4">
            <div className="klynaa-kpi-card">
              <div className="flex items-center justify-between mb-2">
                <CurrencyDollarIconSolid className="w-5 h-5 text-green-600" />
                <span className="klynaa-caption">XAF</span>
              </div>
              <div className="klynaa-h1 text-gray-900 mb-1">{stats.total_earnings.toLocaleString()}</div>
              <div className="klynaa-caption">Total Earnings</div>
            </div>

            <div className="klynaa-kpi-card">
              <div className="flex items-center justify-between mb-2">
                <CircleStackIconSolid className="w-5 h-5 text-orange-600" />
                <span className="klynaa-caption">tasks</span>
              </div>
              <div className="klynaa-h1 text-gray-900 mb-1">{stats.pending_pickups}</div>
              <div className="klynaa-caption">Pending Pickups</div>
            </div>

            <div className="klynaa-kpi-card">
              <div className="flex items-center justify-between mb-2">
                <CheckCircleIconSolid className="w-5 h-5 text-green-600" />
                <span className="klynaa-caption">today</span>
              </div>
              <div className="klynaa-h1 text-gray-900 mb-1">{stats.completed_today}</div>
              <div className="klynaa-caption">Completed Today</div>
            </div>

            <div className="klynaa-kpi-card">
              <div className="flex items-center justify-between mb-2">
                <StarIconSolid className="w-5 h-5 text-yellow-600" />
                <span className="klynaa-caption">avg</span>
              </div>
              <div className="klynaa-h1 text-gray-900 mb-1">{stats.avg_rating.toFixed(1)}</div>
              <div className="klynaa-caption">Rating</div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <span className="klynaa-h2 text-gray-700">Filters</span>
            </div>

            <div className="mb-3">
              <div className="klynaa-caption mb-2">Waste Type</div>
              <div className="flex flex-wrap gap-1">
                {['all', 'general', 'recyclable', 'green', 'hazardous'].map(type => (
                  <button
                    key={type}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      wasteTypeFilter === type
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setWasteTypeFilter(type)}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="klynaa-caption mb-2">Distance</div>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(e.target.value)}
              >
                <option value="all">All Distances</option>
                <option value="1">Within 1km</option>
                <option value="3">Within 3km</option>
                <option value="5">Within 5km</option>
                <option value="10">Within 10km</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex gap-1">
                {[
                  { key: 'bins', label: 'Bins (Full)', count: bins.filter(b => b.status === 'full').length },
                  { key: 'accepted', label: 'Accepted', count: pickups.filter(p => p.status === 'accepted').length },
                  { key: 'completed', label: 'Completed', count: stats.completed_today },
                  { key: 'history', label: 'History', count: 0 }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-teal-100 text-teal-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab(tab.key as any)}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Task List Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'bins' && filteredPickups.filter(p => p.status === 'pending').map(pickup => (
                <TaskItem
                  key={pickup.id}
                  pickup={pickup}
                  isExpanded={expandedTask === pickup.id}
                  onToggleExpand={() => setExpandedTask(expandedTask === pickup.id ? null : pickup.id)}
                  onAccept={() => handleAcceptPickup(pickup.id)}
                  onStartRoute={() => handleStartRoute(pickup.id)}
                  onReportIssue={() => handleReportIssue(pickup.id)}
                />
              ))}

              {activeTab === 'accepted' && filteredPickups.filter(p => p.status === 'accepted').map(pickup => (
                <TaskItem
                  key={pickup.id}
                  pickup={pickup}
                  isExpanded={expandedTask === pickup.id}
                  onToggleExpand={() => setExpandedTask(expandedTask === pickup.id ? null : pickup.id)}
                  onAccept={() => handleAcceptPickup(pickup.id)}
                  onStartRoute={() => handleStartRoute(pickup.id)}
                  onReportIssue={() => handleReportIssue(pickup.id)}
                />
              ))}

              {activeTab === 'completed' && (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-green-300 mx-auto mb-3" />
                  <div className="klynaa-body text-gray-500">Completed tasks will appear here</div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="text-center py-8">
                  <CircleStackIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <div className="klynaa-body text-gray-500">Task history will appear here</div>
                </div>
              )}

              {((activeTab === 'bins' && filteredPickups.filter(p => p.status === 'pending').length === 0) ||
                (activeTab === 'accepted' && filteredPickups.filter(p => p.status === 'accepted').length === 0)) && (
                <div className="text-center py-8">
                  <CircleStackIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <div className="klynaa-body text-gray-500">No bins match your filters</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-map-pane">
          <div className="dashboard-map-container">
            <WorkerMap
              pickups={bins.map(bin => ({
                id: parseInt(bin.id),
                title: `${bin.owner_name} - ${bin.waste_type}`,
                latitude: bin.lat,
                longitude: bin.lng,
                status: bin.status === 'full' ? 'pending' : 'completed',
                address: bin.address,
                customer_name: bin.owner_name,
                distance: bin.distance,
                created_at: bin.last_reported_at,
                waste_type: bin.waste_type
              }))}
              selectedPickupId={selectedBin ? parseInt(selectedBin) : null}
              onPickupSelect={handleBinSelect}
            />
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default WorkerDashboard;
