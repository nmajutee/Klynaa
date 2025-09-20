import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../stores';
import {
    HomeIcon,
    MapIcon,
    TruckIcon,
    ChatBubbleLeftRightIcon,
    CurrencyDollarIcon,
    StarIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    CheckCircleIcon,
    ClockIcon,
    PowerIcon,
} from '@heroicons/react/24/outline';
import { authApi } from '../services/api';

interface WorkerLayoutProps {
    children: React.ReactNode;
}

const WorkerLayout: React.FC<WorkerLayoutProps> = ({ children }) => {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workerStatus, setWorkerStatus] = useState<'active' | 'offline' | 'verification_pending'>('active');

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            logout();
            router.push('/');
        }
    };

    const toggleWorkerStatus = () => {
        setWorkerStatus(current => current === 'active' ? 'offline' : 'active');
    };

    // Worker-specific navigation items
    const navigationItems = [
        {
            name: 'Dashboard',
            href: '/worker/dashboard',
            icon: HomeIcon,
            description: 'Quick stats and overview'
        },
        {
            name: 'Available Pickups',
            href: '/worker/available-pickups',
            icon: MapIcon,
            description: 'Map and list view of available bins'
        },
        {
            name: 'My Pickups',
            href: '/worker/my-pickups',
            icon: TruckIcon,
            description: 'Pending and completed pickups'
        },
        {
            name: 'Chat & Messages',
            href: '/worker/messages',
            icon: ChatBubbleLeftRightIcon,
            description: 'Communication with bin owners',
            badge: 3 // Unread messages count
        },
        {
            name: 'Earnings & Payments',
            href: '/worker/earnings',
            icon: CurrencyDollarIcon,
            description: 'Balance, withdrawals, payment history'
        },
        {
            name: 'Reviews & Ratings',
            href: '/worker/reviews',
            icon: StarIcon,
            description: 'Customer ratings and reputation'
        },
        {
            name: 'Account & Settings',
            href: '/worker/settings',
            icon: UserCircleIcon,
            description: 'Profile, verification, preferences'
        }
    ];

    const getStatusColor = () => {
        switch (workerStatus) {
            case 'active':
                return 'bg-green-500';
            case 'offline':
                return 'bg-gray-500';
            case 'verification_pending':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        switch (workerStatus) {
            case 'active':
                return 'Active';
            case 'offline':
                return 'Offline';
            case 'verification_pending':
                return 'Verification Pending';
            default:
                return 'Unknown';
        }
    };

    const Sidebar = () => (
        <div className="flex h-full flex-col bg-klynaa-darkgreen">
            {/* Logo & Worker Info */}
            <div className="flex h-20 shrink-0 items-center px-4 border-b border-white/20">
                <div className="flex items-center space-x-3">
                    <TruckIcon className="h-8 w-8 text-white" />
                    <div>
                        <h1 className="text-xl font-bold text-white">Klynaa</h1>
                        <p className="text-xs text-green-200">Worker Portal</p>
                    </div>
                </div>
            </div>

            {/* Worker Status & Profile */}
            <div className="px-4 py-4 border-b border-white/20">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor()} rounded-full border-2 border-white`}></div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user?.name || 'Worker'}</p>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-200">{getStatusText()}</span>
                            <button
                                onClick={toggleWorkerStatus}
                                className="text-xs text-green-300 hover:text-white transition-colors"
                            >
                                {workerStatus === 'active' ? 'Go Offline' : 'Go Active'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 rounded px-2 py-1">
                        <p className="text-xs text-green-200">Active</p>
                        <p className="text-sm font-semibold text-white">2</p>
                    </div>
                    <div className="bg-white/10 rounded px-2 py-1">
                        <p className="text-xs text-green-200">Completed</p>
                        <p className="text-sm font-semibold text-white">38</p>
                    </div>
                    <div className="bg-white/10 rounded px-2 py-1">
                        <p className="text-xs text-green-200">Rating</p>
                        <p className="text-sm font-semibold text-white">4.7</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4">
                <ul className="space-y-1">
                    {navigationItems.map((item) => {
                        const isActive = router.pathname === item.href ||
                            (item.href !== '/worker/dashboard' && router.pathname.startsWith(item.href));

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`group flex items-center justify-between rounded-lg p-3 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-green-200 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-xs opacity-75">{item.description}</p>
                                        </div>
                                    </div>
                                    {item.badge && (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-klynaa-darkgreen bg-white/70 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-4 border-t border-white/20">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium bg-white text-klynaa-darkgreen hover:bg-gray-100 transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-64">
                    <Sidebar />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-72 lg:flex-col">
                <Sidebar />
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col lg:pl-0">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-200 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* Current earnings display */}
                            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                                <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">15,000 XAF</span>
                                <span className="text-xs text-green-600">today</span>
                            </div>

                            {/* Notifications */}
                            <button className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                                <BellIcon className="h-6 w-6" />
                                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    2
                                </span>
                            </button>
                        </div>

                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* Mobile menu button */}
                            <button
                                type="button"
                                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default WorkerLayout;