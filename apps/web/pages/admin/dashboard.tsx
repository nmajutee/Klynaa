import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icons';
import { Card } from '../../src/design-system/components/Card';
import { Badge } from '../../src/design-system/components/Badge';
import WorkingThemeToggle from '../../src/components/ui/WorkingThemeToggle';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

interface SystemMetrics {
  totalUsers: number;
  activePickups: number;
  totalRevenue: number;
  disputesPending: number;
}

interface UserData {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Pending' | 'Banned';
  email: string;
  joinDate: string;
}

// Mock data that would typically come from backend
const mockMetrics: SystemMetrics = {
  totalUsers: 1250,
  activePickups: 82,
  totalRevenue: 12450,
  disputesPending: 5,
};

const mockUsers: UserData[] = [
  { id: '1', name: 'John Doe', role: 'Bin Owner', status: 'Active', email: 'john@email.com', joinDate: '2024-01-15' },
  { id: '2', name: 'Jane Smith', role: 'Worker', status: 'Pending', email: 'jane@email.com', joinDate: '2024-02-20' },
  { id: '3', name: 'Sam Wilson', role: 'Worker', status: 'Banned', email: 'sam@email.com', joinDate: '2024-01-10' },
  { id: '4', name: 'Mary Johnson', role: 'Bin Owner', status: 'Active', email: 'mary@email.com', joinDate: '2024-03-05' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'admin') {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-klynaa-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
        <div className="flex h-screen bg-gray-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 text-white flex flex-col shadow-xl border-r border-neutral-600" style={{ backgroundColor: '#2E7D32' }}>
        {/* Header */}
        <div className="p-4 border-b border-green-600">
          <h2 className="text-2xl font-bold text-white">Klynaa Admin</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center p-3 rounded-lg font-medium transition-colors bg-white" style={{ color: '#4CAF50' }}>
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link href="/admin/users" className="flex items-center p-3 rounded-lg font-medium transition-colors text-white hover:bg-white hover:bg-opacity-20 hover:text-white">
            <Icon name="Users" className="w-5 h-5 mr-3" />
            User Management
          </Link>
          <Link href="/admin/pickups" className="flex items-center p-3 rounded-lg font-medium transition-colors text-white hover:bg-white hover:bg-opacity-20 hover:text-white">
            <Icon name="Truck" className="w-5 h-5 mr-3" />
            Pickup Management
          </Link>
          <Link href="/admin/finance" className="flex items-center p-3 rounded-lg font-medium transition-colors text-white hover:bg-white hover:bg-opacity-20 hover:text-white">
            <Icon name="CreditCard" className="w-5 h-5 mr-3" />
            Payment & Finance
          </Link>
          <Link href="/admin/reports" className="flex items-center p-3 rounded-lg font-medium transition-colors text-white hover:bg-white hover:bg-opacity-20 hover:text-white">
            <Icon name="FileText" className="w-5 h-5 mr-3" />
            Reports
          </Link>
          <Link href="/admin/disputes" className="flex items-center p-3 rounded-lg font-medium transition-colors text-white hover:bg-white hover:bg-opacity-20 hover:text-white">
            <Icon name="MessageSquare" className="w-5 h-5 mr-3" />
            Reviews & Disputes
          </Link>
          <Link href="/admin/settings" className="flex items-center p-3 rounded-lg font-medium transition-colors text-white hover:bg-white hover:bg-opacity-20 hover:text-white">
            <Icon name="Settings" className="w-5 h-5 mr-3" />
            System Settings
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" style={{ color: '#4CAF50' }} />
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name || user?.email || 'Admin User'}</p>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
          <div className="flex items-center space-x-4">
            <WorkingThemeToggle />
            <Icon name="Bell" className="w-5 h-5 text-klynaa-neutral dark:text-neutral-400" />
            <button className="px-4 py-2 rounded-lg transition-colors font-medium hover:shadow-md border-2 bg-white dark:bg-neutral-800 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-neutral-700">
              Create Report
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-gray-50 dark:bg-neutral-900 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.totalUsers.toLocaleString()}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Active Pickups</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.activePickups}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Total Revenue</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">${mockMetrics.totalRevenue.toLocaleString()}</p>
            </Card>
            <Card>
              <h3 className="text-klynaa-graylabel dark:text-neutral-400 text-sm font-medium">Disputes Pending</h3>
              <p className="text-3xl font-bold text-klynaa-dark dark:text-white">{mockMetrics.disputesPending}</p>
            </Card>
          </div>

          {/* Pickup Management Map */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-klynaa-dark dark:text-white">Pickup Management</h3>
            <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Icon name="Map" className="w-12 h-12 text-klynaa-graylabel mx-auto mb-2" />
                <p className="text-klynaa-neutral dark:text-neutral-400">Interactive Map View</p>
                <p className="text-sm text-klynaa-graylabel dark:text-neutral-500">Pickup locations and routes</p>
              </div>
            </div>
          </Card>

          {/* User Management Table */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-klynaa-dark dark:text-white">User Management</h3>
              <Link href="/admin/users">
                <button className="bg-transparent border border-klynaa-primary text-klynaa-primary hover:bg-klynaa-primary hover:text-white px-3 py-1 rounded-lg text-sm transition-colors">
                  View All Users
                </button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="p-2 text-klynaa-graylabel dark:text-neutral-400 font-medium">Name</th>
                    <th className="p-2 text-klynaa-graylabel dark:text-neutral-400 font-medium">Role</th>
                    <th className="p-2 text-klynaa-graylabel dark:text-neutral-400 font-medium">Status</th>
                    <th className="p-2 text-klynaa-graylabel dark:text-neutral-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-klynaa-dark dark:text-white">
                  {mockUsers.map((userData) => (
                    <tr key={userData.id} className="border-b border-neutral-100 dark:border-neutral-700">
                      <td className="p-2 font-medium">{userData.name}</td>
                      <td className="p-2">{userData.role}</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            userData.status === 'Active' ? 'success' :
                            userData.status === 'Pending' ? 'warning' : 'danger'
                          }
                        >
                          {userData.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <button className="text-klynaa-primary hover:text-klynaa-darkgreen transition-colors font-medium">
                          {userData.status === 'Pending' ? 'Verify' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}