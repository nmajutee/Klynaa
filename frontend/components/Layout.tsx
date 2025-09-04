import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '../stores';
import {
    HomeIcon,
    TrashIcon,
    TruckIcon,
    UserGroupIcon,
    ChartBarIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import { authApi } from '../services/api';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { sidebarOpen, setSidebarOpen } = useUIStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            logout();
            router.push('/auth/login');
        }
    };

    // Navigation items based on user role
    const getNavigationItems = () => {
        const baseItems = [
            { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        ];

        if (user?.role === 'admin') {
            return [
                ...baseItems,
                { name: 'Bins', href: '/bins', icon: TrashIcon },
                { name: 'Pickups', href: '/pickups', icon: TruckIcon },
                { name: 'Users', href: '/users', icon: UserGroupIcon },
                { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
                { name: 'Settings', href: '/settings', icon: CogIcon },
            ];
        } else if (user?.role === 'worker') {
            return [
                ...baseItems,
                { name: 'Available Pickups', href: '/pickups/available', icon: TruckIcon },
                { name: 'My Pickups', href: '/pickups/mine', icon: TruckIcon },
                { name: 'Profile', href: '/profile', icon: UserGroupIcon },
            ];
        } else if (user?.role === 'customer') {
            return [
                ...baseItems,
                { name: 'My Bins', href: '/bins', icon: TrashIcon },
                { name: 'Request Pickup', href: '/pickups/request', icon: TruckIcon },
                { name: 'My Pickups', href: '/pickups/mine', icon: TruckIcon },
                { name: 'Profile', href: '/profile', icon: UserGroupIcon },
            ];
        }

        return baseItems;
    };

    const navigationItems = getNavigationItems();

    const Sidebar = () => (
        <div className="flex h-full flex-col bg-gray-900">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-4">
                <h1 className="text-xl font-bold text-white">Klynaa</h1>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col px-4 pb-4">
                <ul className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul className="-mx-2 space-y-1">
                            {navigationItems.map((item) => {
                                const isActive = router.pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${isActive
                                                    ? 'bg-gray-800 text-white'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className="h-6 w-6 shrink-0" />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>

                    {/* User info and logout */}
                    <li className="mt-auto">
                        <div className="border-t border-gray-700 pt-4">
                            <div className="flex items-center gap-x-4 px-2 py-3 text-sm text-gray-400">
                                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                            >
                                <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" />
                                Logout
                            </button>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    );

    return (
        <div className="h-screen flex">
            {/* Desktop Sidebar */}
            <div className={`hidden lg:flex lg:w-72 lg:flex-col ${sidebarOpen ? '' : 'lg:w-0'}`}>
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <>
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
                        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900">
                            <div className="flex h-16 shrink-0 items-center justify-between px-4">
                                <h1 className="text-xl font-bold text-white">Klynaa</h1>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="h-[calc(100%-4rem)]">
                                <Sidebar />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Top Navigation */}
                <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-700 lg:hidden"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="h-6 w-px bg-gray-200 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1"></div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <button className="text-gray-400 hover:text-gray-500">
                                <BellIcon className="h-6 w-6" />
                            </button>

                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

                            <div className="flex items-center gap-x-2">
                                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center lg:hidden">
                                    <span className="text-sm font-medium text-white">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </span>
                                </div>
                                <span className="hidden lg:flex lg:items-center lg:text-sm lg:font-semibold lg:text-gray-900">
                                    {user?.first_name} {user?.last_name}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
