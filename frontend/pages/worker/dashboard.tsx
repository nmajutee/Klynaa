/**
 * Worker Dashboard - Main Overview Page
 * Mobile-first design with profile status, overview cards, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PrivateRoute from '../../components/PrivateRoute';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PickupSidebar from '../../components/worker/PickupSidebar';
import dynamic from 'next/dynamic';

const WorkerMap = dynamic(() => import('../../components/WorkerMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse" />
});

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

const WorkerDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await enhancedWorkerDashboardApi.getOverview();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false)
      );
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
    requestLocationPermission();
  }, []);

  return (
    <PrivateRoute requiredRole="worker">
      <Head>
        <title>Worker Dashboard - Klynaa</title>
        <meta name="description" content="Klynaa Worker Dashboard" />
      </Head>
      <WorkerLayout
        sidebar={
          <div className="flex flex-col h-full">
            {/* Profile / Status Card */}
            <div className="p-6 border-b bg-white/80 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-600 font-semibold">
                    {dashboardData?.profile.name.charAt(0).toUpperCase() || 'W'}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-semibold text-gray-900 truncate">{dashboardData?.profile.name || 'Worker'}</h1>
                  <p className="text-xs text-gray-500 truncate">{dashboardData?.profile.status.label || 'Active'}</p>
                </div>
                <button
                  onClick={toggleAvailability}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${isAvailable ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 hover:text-gray-800 border-gray-200'}`}
                >
                  {isAvailable ? 'Online' : 'Offline'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 rounded-lg bg-gray-50">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Earned</div>
                  <div className="text-sm font-semibold text-gray-800">{dashboardData?.overview_cards.total_earnings.formatted || '0 XAF'}</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Rating</div>
                  <div className="text-sm font-semibold text-gray-800">{dashboardData?.overview_cards.average_rating.value || '0'}</div>
                </div>
              </div>
            </div>
            {/* Pickup list tabs */}
            <PickupSidebar onSelectPickup={(p:any)=> setSelectedPickupId(p.id)} activePickupId={selectedPickupId || undefined} />
          </div>
        }
      >
        {/* Map + Overlay Metrics */}
        <div className="h-full relative">
          <WorkerMap pickups={[]} selectedPickupId={selectedPickupId} className="h-full" />
          <div className="absolute top-4 left-4 right-4 lg:left-8 lg:right-8 flex flex-wrap gap-4 pointer-events-none">
            {['pending_pickups','completed_pickups','average_rating'].map((k) => {
              const card: any = dashboardData?.overview_cards ? (dashboardData.overview_cards as any)[k] : null;
              if (!card) return null;
              return (
                <div key={k} className="pointer-events-auto bg-white/90 backdrop-blur rounded-xl px-4 py-3 shadow-sm border flex items-center gap-3">
                  <span className="text-xl">{card.icon}</span>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{card.label || k.replace('_',' ')}</div>
                    <div className="text-sm font-semibold text-gray-800">{card.formatted || card.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </WorkerLayout>
    </PrivateRoute>
  );
};

export default WorkerDashboard;