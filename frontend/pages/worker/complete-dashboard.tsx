/**
 * Complete Worker Dashboard - Agricultural Field Management Style
 * Integrates all worker components in a comprehensive dashboard system
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  MapPinIcon,
  TruckIcon,
  CurrencyDollarIcon,
  StarIcon,
  BellIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  MapIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import PrivateRoute from '../../components/PrivateRoute';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const WorkerMap = dynamic(() => import('../../components/WorkerMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
});

const PickupManagement = dynamic(() => import('../../components/worker/PickupManagement'), {
  ssr: false
});

const EarningsDashboard = dynamic(() => import('../../components/worker/EarningsDashboard'), {
  ssr: false
});

const ChatSystem = dynamic(() => import('../../components/worker/ChatSystem'), {
  ssr: false
});

const WorkerProfileManagement = dynamic(() => import('../../components/worker/WorkerProfileManagement'), {
  ssr: false
});

interface DashboardProps {}

const CompleteWorkerDashboard: React.FC<DashboardProps> = () => {
  const [activeView, setActiveView] = useState<'overview' | 'pickups' | 'map' | 'earnings' | 'chat' | 'profile'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workerLocation, setWorkerLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | undefined>(undefined);

  // Mock data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    profile: {
      id: 1,
      name: 'Tamás Horváth',
      profile_picture: null,
      status: { status: 'active', color: 'bg-green-500', label: 'Active' },
      location: { latitude: 3.848, longitude: 11.502 }
    },
    stats: {
      totalEarnings: 85420,
      todayEarnings: 12500,
      weekEarnings: 45300,
      monthEarnings: 78900,
      averagePerPickup: 2500,
      totalPickups: 34,
      pendingPickups: 7,
      completedPickups: 27,
      averageRating: 4.8
    }
  });

  const [mockConversations] = useState([
    {
      id: 1,
      customer_id: 1,
      customer_name: 'John Doe',
      pickup_id: 123,
      last_message: 'Thanks for the quick pickup!',
      last_message_time: new Date().toISOString(),
      unread_count: 0,
      status: 'active' as const
    },
    {
      id: 2,
      customer_id: 2,
      customer_name: 'Jane Smith',
      pickup_id: 124,
      last_message: 'When will you arrive?',
      last_message_time: new Date(Date.now() - 300000).toISOString(),
      unread_count: 2,
      status: 'active' as const
    }
  ]);

  const [mockTransactions] = useState([
    {
      id: 1,
      pickup_id: 123,
      customer_name: 'John Doe',
      amount: 2500,
      status: 'paid' as const,
      date: '2024-01-15',
      location: 'Yaoundé, Cameroon'
    },
    {
      id: 2,
      pickup_id: 124,
      customer_name: 'Jane Smith',
      amount: 3000,
      status: 'pending' as const,
      date: '2024-01-14',
      location: 'Douala, Cameroon'
    }
  ]);

  const [mockProfile] = useState({
    id: 1,
    name: 'Tamás Horváth',
    email: 'tamas.horvath@klynaa.com',
    phone: '+237 123 456 789',
    address: '123 Green Street, Yaoundé, Cameroon',
    service_areas: ['Yaoundé', 'Douala', 'Bamenda'],
    verification_status: 'verified' as const,
    status: 'active' as const,
    rating: 4.8,
    total_reviews: 156,
    date_joined: '2023-06-15',
    documents: {
      id_card: '/documents/id-card.jpg',
      drivers_license: '/documents/license.jpg',
      proof_of_residence: '/documents/residence.jpg'
    },
    notifications: {
      pickup_requests: true,
      earnings_updates: true,
      system_messages: true,
      marketing_emails: false
    }
  });

  useEffect(() => {
    // Request location permission on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setWorkerLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.log('Location permission denied:', error)
      );
    }
  }, []);

  const navigationItems = [
    { id: 'overview', name: 'Dashboard', icon: UserCircleIcon, view: 'overview' },
    { id: 'pickups', name: 'Pickups', icon: ClipboardDocumentListIcon, view: 'pickups' },
    { id: 'map', name: 'Map', icon: MapIcon, view: 'map' },
    { id: 'earnings', name: 'Earnings', icon: CurrencyDollarIcon, view: 'earnings' },
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon, view: 'chat' },
    { id: 'profile', name: 'Profile', icon: Cog6ToothIcon, view: 'profile' },
  ];

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Active Fields',
                  value: dashboardData.stats.pendingPickups,
                  subtitle: 'Active fields',
                  color: 'text-yellow-600',
                  bgColor: 'bg-yellow-50',
                  icon: MapPinIcon
                },
                {
                  title: 'Total Balance',
                  value: `${dashboardData.stats.totalEarnings.toLocaleString()},-eFt`,
                  subtitle: 'Total balance',
                  color: 'text-green-600',
                  bgColor: 'bg-green-50',
                  icon: TruckIcon
                },
                {
                  title: 'Fuel Used',
                  value: '10,390 L',
                  subtitle: 'Fuel used',
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50',
                  icon: TruckIcon
                },
                {
                  title: 'Input Materials',
                  value: `${dashboardData.stats.completedPickups},-eFt`,
                  subtitle: 'Value of input materials',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-50',
                  icon: CurrencyDollarIcon
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className={`${stat.bgColor} overflow-hidden rounded-lg px-4 py-5 shadow`}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <IconComponent className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className={`text-sm font-medium truncate ${stat.color.replace('text-', 'text-').replace('-600', '-900')}`}>
                            {stat.title}
                          </dt>
                          <dd className={`text-2xl font-bold ${stat.color.replace('text-', 'text-').replace('-600', '-900')}`}>
                            {stat.value}
                          </dd>
                          <dd className={`text-xs opacity-75 ${stat.color.replace('text-', 'text-').replace('-600', '-900')}`}>
                            {stat.subtitle}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Field Overview</h3>
              </div>
              <div className="h-96">
                <WorkerMap
                  pickups={[]}
                  workerLocation={workerLocation}
                  onLocationUpdate={(lat, lng) => setWorkerLocation({latitude: lat, longitude: lng})}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        );

      case 'pickups':
        return (
          <PickupManagement
            selectedPickup={selectedPickup}
            onPickupAction={(id, action) => {
              console.log('Pickup action:', id, action);
              setSelectedPickup(null);
            }}
            onClose={() => setSelectedPickup(null)}
          />
        );

      case 'map':
        return (
          <div className="h-full bg-white rounded-lg shadow overflow-hidden">
            <WorkerMap
              pickups={[]}
              workerLocation={workerLocation}
              onPickupSelect={(pickup) => setSelectedPickup(pickup)}
              onLocationUpdate={(lat, lng) => setWorkerLocation({latitude: lat, longitude: lng})}
              className="h-full min-h-[600px]"
            />
          </div>
        );

      case 'earnings':
        return (
          <EarningsDashboard
            stats={dashboardData.stats}
            transactions={mockTransactions}
          />
        );

      case 'chat':
        return (
          <div className="h-full bg-white rounded-lg shadow overflow-hidden">
            <ChatSystem
              conversations={mockConversations}
              selectedConversationId={selectedConversation}
              onSelectConversation={setSelectedConversation}
              className="h-96 lg:h-[600px]"
            />
          </div>
        );

      case 'profile':
        return (
          <WorkerProfileManagement
            profile={mockProfile}
            onUpdateProfile={async (data) => {
              console.log('Update profile:', data);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PrivateRoute requiredRole="worker">
      <Head>
        <title>Complete Worker Dashboard - Klynaa</title>
        <meta name="description" content="Comprehensive waste collection worker dashboard" />
      </Head>

      <div className="h-screen bg-gray-50 flex">
        {/* Sidebar for desktop */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="text-xl font-bold text-green-600">🌱 agronomus</div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="mt-8 px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.view as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 mr-3"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {navigationItems.find(item => item.view === activeView)?.name || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Keep track of & manage your active & past fields
                  </p>
                </div>
              </div>

              {/* Profile section */}
              <div className="flex items-center space-x-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  + Add new field
                </button>

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {dashboardData.profile.name}
                    </p>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${dashboardData.profile.status.color} mr-2`}></div>
                      <span className="text-xs text-gray-500">{dashboardData.profile.status.label}</span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserCircleIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <BellIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </PrivateRoute>
  );
};

export default CompleteWorkerDashboard;