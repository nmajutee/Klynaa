import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icons';
import { Card } from '../../src/design-system/components/Card';
import { Badge } from '../../src/design-system/components/Badge';

interface BinOwnerUser {
  id: string;
  email: string;
  name: string;
  role: 'bin-owner' | 'customer';
}

interface BinOwnerMetrics {
  registeredBins: number;
  activeRequests: number;
  paymentStatus: string;
  avgResponse: string;
}

interface BinData {
  id: string;
  name: string;
  status: 'Full' | 'Empty' | 'Half Full';
  location: string;
  lastPickup: string;
}

interface PickupRequest {
  id: string;
  binId: string;
  status: 'In-Progress' | 'Completed' | 'Pending';
  worker: string;
  workerRating: number;
  requestDate: string;
  progress: number;
}

// Mock data
const mockMetrics: BinOwnerMetrics = {
  registeredBins: 2,
  activeRequests: 1,
  paymentStatus: 'Paid',
  avgResponse: '2.5 hrs',
};

const mockBins: BinData[] = [
  {
    id: '1',
    name: 'Main Residential Bin',
    status: 'Full',
    location: '123 Main St',
    lastPickup: '2024-03-01'
  },
  {
    id: '2',
    name: 'Recycling Bin',
    status: 'Empty',
    location: '123 Main St',
    lastPickup: '2024-03-10'
  }
];

const mockActiveRequest: PickupRequest = {
  id: 'KLYN7890',
  binId: '1',
  status: 'In-Progress',
  worker: 'Jane S.',
  workerRating: 4.8,
  requestDate: '2024-03-15',
  progress: 66
};

export default function BinOwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<BinOwnerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'bin-owner' || parsedUser.role === 'customer') {
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

  const handleRequestPickup = (binId: string) => {
    // In a real app, this would make an API call
    console.log('Requesting pickup for bin:', binId);
    alert('Pickup request submitted! A worker will be assigned shortly.');
  };

  const handleAddBin = () => {
    // Navigate to add bin form
    console.log('Adding new bin');
    alert('Add Bin functionality would open a form here.');
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
      <div className="w-64 bg-klynaa-dark dark:bg-neutral-800 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-600">
          <h2 className="text-2xl font-bold">Klynaa Bin Owner</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/bin-owner/dashboard" className="flex items-center p-2 rounded bg-klynaa-primary text-white">
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link href="/bin-owner/bins" className="flex items-center p-2 rounded hover:bg-neutral-700 transition-colors">
            <Icon name="Trash2" className="w-5 h-5 mr-3" />
            Bin Management
          </Link>
          <Link href="/bin-owner/requests" className="flex items-center p-2 rounded hover:bg-neutral-700 transition-colors">
            <Icon name="FileText" className="w-5 h-5 mr-3" />
            Pickup Requests
          </Link>
          <Link href="/bin-owner/payments" className="flex items-center p-2 rounded hover:bg-neutral-700 transition-colors">
            <Icon name="CreditCard" className="w-5 h-5 mr-3" />
            Payments
          </Link>
          <Link href="/bin-owner/reviews" className="flex items-center p-2 rounded hover:bg-neutral-700 transition-colors">
            <Icon name="Star" className="w-5 h-5 mr-3" />
            Ratings & Reviews
          </Link>
          <Link href="/profile" className="flex items-center p-2 rounded hover:bg-neutral-700 transition-colors">
            <Icon name="User" className="w-5 h-5 mr-3" />
            Profile Settings
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-neutral-600">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-klynaa-primary flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">John Doe</p>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
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
          <h2 className="text-xl font-semibold text-klynaa-dark dark:text-white">Bin Owner Dashboard</h2>
          <div className="flex items-center space-x-4">
            <Icon name="Bell" className="w-5 h-5 text-klynaa-neutral dark:text-neutral-400" />
            <button className="bg-klynaa-primary hover:bg-klynaa-darkgreen text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Request Pickup
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-klynaa-lightgray dark:bg-neutral-900 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Registered Bins</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.registeredBins}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Active Requests</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.activeRequests}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Payment Status</h3>
              <p className="text-3xl font-bold text-klynaa-primary">{mockMetrics.paymentStatus}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Avg. Response</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.avgResponse}</p>
            </Card>
          </div>

          {/* My Bins */}
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-klynaa-dark dark:text-white">My Bins</h3>
              <button
                className="bg-transparent border border-klynaa-primary text-klynaa-primary hover:bg-klynaa-primary hover:text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center"
                onClick={handleAddBin}
              >
                <Icon name="Plus" className="w-4 h-4 mr-1" />
                Add Bin
              </button>
            </div>
            <div className="space-y-4">
              {mockBins.map((bin) => (
                <div key={bin.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-klynaa-dark dark:text-white">{bin.name}</p>
                    <p className="text-sm text-klynaa-graylabel dark:text-neutral-400">{bin.location}</p>
                    <p className="text-sm">
                      <Badge
                        variant={
                          bin.status === 'Full' ? 'danger' :
                          bin.status === 'Half Full' ? 'warning' : 'success'
                        }
                      >
                        {bin.status}
                      </Badge>
                    </p>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      bin.status === 'Full'
                        ? 'bg-klynaa-primary hover:bg-klynaa-darkgreen text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={bin.status === 'Empty'}
                    onClick={() => handleRequestPickup(bin.id)}
                  >
                    Request Pickup
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Pickup History */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-klynaa-dark dark:text-white">Pickup History</h3>
              <Link href="/bin-owner/requests">
                <button className="bg-transparent border border-klynaa-primary text-klynaa-primary hover:bg-klynaa-primary hover:text-white px-3 py-1 rounded-lg text-sm transition-colors">
                  View All Requests
                </button>
              </Link>
            </div>
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <p className="font-semibold text-klynaa-dark dark:text-white">Request #{mockActiveRequest.id}</p>
              <p className="text-sm text-klynaa-graylabel dark:text-neutral-400">
                Status: <Badge variant="warning">{mockActiveRequest.status}</Badge>
              </p>
              <p className="text-sm text-klynaa-graylabel dark:text-neutral-400 flex items-center">
                Worker: {mockActiveRequest.worker} ({mockActiveRequest.workerRating}
                <Icon name="Star" className="w-4 h-4 text-klynaa-yellow ml-1 fill-current" />)
              </p>
              <div className="mt-2 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                <div
                  className="h-2 bg-klynaa-primary rounded-full transition-all duration-300"
                  style={{width: `${mockActiveRequest.progress}%`}}
                />
              </div>
              <p className="text-xs text-right mt-1 text-klynaa-graylabel dark:text-neutral-400">
                {mockActiveRequest.progress}% Complete
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}