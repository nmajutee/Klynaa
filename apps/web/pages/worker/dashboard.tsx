import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icons';
import { Card } from '../../src/design-system/components/Card';
import { Badge } from '../../src/design-system/components/Badge';

interface WorkerUser {
  id: string;
  email: string;
  name: string;
  role: 'worker';
}

interface WorkerMetrics {
  pendingPickups: number;
  completedToday: number;
  totalEarnings: number;
  rating: number;
}

interface PickupJob {
  id: string;
  title: string;
  location: string;
  distance: string;
  urgency: 'Urgent' | 'Standard';
  status: 'available' | 'accepted' | 'in-progress' | 'completed';
  estimatedPay: number;
}

// Mock data
const mockMetrics: WorkerMetrics = {
  pendingPickups: 3,
  completedToday: 12,
  totalEarnings: 256.50,
  rating: 4.8,
};

const mockAvailableJobs: PickupJob[] = [
  {
    id: '1',
    title: 'Residential Bin - 123 Main St',
    location: '123 Main St',
    distance: '2.5km away',
    urgency: 'Urgent',
    status: 'available',
    estimatedPay: 15.00
  },
  {
    id: '2',
    title: 'Commercial Dumpster - 456 Oak Ave',
    location: '456 Oak Ave',
    distance: '5.1km away',
    urgency: 'Standard',
    status: 'available',
    estimatedPay: 25.00
  }
];

const mockActiveJob: PickupJob = {
  id: '3',
  title: 'Recycling Bin - 789 Pine Ln',
  location: '789 Pine Ln',
  distance: '1.2km away',
  urgency: 'Standard',
  status: 'in-progress',
  estimatedPay: 18.00
};

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<WorkerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'worker') {
        setUser(parsedUser);
      } else {
        router.push(`/${parsedUser.role}/dashboard`);
        return;
      }
    } else {
      router.push('/auth/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('klynaa_user');
    router.push('/auth/login');
  };

  const handleAcceptJob = (jobId: string) => {
    // In a real app, this would make an API call
    console.log('Accepting job:', jobId);
    alert('Job accepted! You can track progress in Active Pickups.');
  };

  const handleMarkCollected = () => {
    alert('Pickup marked as collected! Awaiting payment confirmation.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-klynaa-lightgray dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-klynaa-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-klynaa-lightgray dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 text-white flex flex-col shadow-xl border-r border-neutral-600" style={{ backgroundColor: '#2E7D32' }}>
        {/* Header */}
        <div className="p-4 border-b border-green-600">
          <h2 className="text-2xl font-bold text-white">Klynaa Worker</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/worker/dashboard" className="flex items-center p-3 rounded-lg font-medium transition-colors bg-white" style={{ color: '#4CAF50' }}>
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link href="/worker/jobs" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="CheckSquare" className="w-5 h-5 mr-3" />
            Available Pickups
          </Link>
          <Link href="/worker/routes" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Navigation" className="w-5 h-5 mr-3" />
            Active Pickups
          </Link>
          <Link href="/worker/earnings" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Wallet" className="w-5 h-5 mr-3" />
            Earnings
          </Link>
          <Link href="/worker/performance" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Star" className="w-5 h-5 mr-3" />
            Performance
          </Link>
          <Link href="/worker/profile" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="User" className="w-5 h-5 mr-3" />
            Profile
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" style={{ color: '#4CAF50' }} />
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name || user?.email || 'Worker User'}</p>
              <button
                onClick={handleLogout}
                className="text-sm text-green-200 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-klynaa-dark dark:text-white" style={{ color: '#1C1C1C' }}>Worker Dashboard</h2>
          <div className="flex items-center space-x-4">
            <Icon name="Bell" className="w-5 h-5 text-klynaa-neutral dark:text-neutral-400" />
            <button
              className="px-4 py-2 rounded-lg transition-colors font-medium hover:shadow-md border-2"
              style={{
                backgroundColor: 'white',
                color: '#4CAF50',
                borderColor: '#4CAF50'
              }}
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-klynaa-lightgray dark:bg-neutral-900 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Pending Pickups</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.pendingPickups}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Completed Today</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.completedToday}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Total Earnings</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">${mockMetrics.totalEarnings}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Rating</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white flex items-center">
                {mockMetrics.rating} <Icon name="Star" className="w-6 h-6 text-klynaa-yellow ml-1 fill-current" />
              </p>
            </Card>
          </div>

          {/* Available Pickups */}
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-klynaa-dark dark:text-white">Available Pickups</h3>
              <Link href="/worker/jobs">
                <button className="bg-transparent border border-klynaa-primary text-klynaa-primary hover:bg-klynaa-primary hover:text-white px-3 py-1 rounded-lg text-sm transition-colors">
                  View All Jobs
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {mockAvailableJobs.map((job) => (
                <div key={job.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-klynaa-dark dark:text-white">{job.title}</p>
                    <p className="text-sm text-klynaa-graylabel dark:text-neutral-400">
                      {job.distance} |
                      <Badge
                        variant={job.urgency === 'Urgent' ? 'warning' : 'secondary'}
                        className="ml-1"
                      >
                        {job.urgency}
                      </Badge>
                    </p>
                    <p className="text-xs text-klynaa-neutral dark:text-neutral-500">
                      Estimated: ${job.estimatedPay}
                    </p>
                  </div>
                  <button
                    className="bg-klynaa-primary hover:bg-klynaa-darkgreen text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    onClick={() => handleAcceptJob(job.id)}
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Pickups */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-klynaa-dark dark:text-white">Active Pickups</h3>
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold text-klynaa-dark dark:text-white">{mockActiveJob.title}</p>
                  <p className="text-sm text-klynaa-graylabel dark:text-neutral-400">
                    Status: <Badge variant="warning">In Progress</Badge>
                  </p>
                </div>
                <Link href="/worker/routes">
                  <button className="bg-transparent border border-klynaa-primary text-klynaa-primary hover:bg-klynaa-primary hover:text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center">
                    <Icon name="Navigation" className="w-4 h-4 mr-1" />
                    Map
                  </button>
                </Link>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  className="flex-1 bg-klynaa-primary hover:bg-klynaa-darkgreen text-white px-3 py-1 rounded-md text-sm transition-colors font-medium"
                  onClick={handleMarkCollected}
                >
                  Mark as Collected
                </button>
                <button className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-not-allowed" disabled>
                  Awaiting Payment
                </button>
                <button className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-not-allowed" disabled>
                  Completed
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}