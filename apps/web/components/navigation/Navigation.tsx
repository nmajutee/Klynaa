import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '../../components/ui/Icons';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useTheme } from '../../src/contexts/SimpleThemeContext';
import ThemeToggle from '../../src/components/ui/ThemeToggle';
import SimpleThemeToggle from '../../src/components/ui/SimpleThemeToggle';
import WorkingThemeToggle from '../../src/components/ui/WorkingThemeToggle';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'worker' | 'admin' | 'bin_owner';
  verification_status?: 'verified' | 'pending' | 'rejected';
  avatar?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  current?: boolean;
  roles?: string[];
  badge?: string;
}

interface NavigationProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Public navigation for non-authenticated users
  const publicNavigation: NavigationItem[] = [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'How It Works', href: '/how-it-works', icon: 'Recycle' },
    { name: 'Service Areas', href: '/service-areas', icon: 'MapPin' },
    { name: 'Pricing', href: '/pricing', icon: 'CreditCard' },
    { name: 'About', href: '/about', icon: 'Users' },
    { name: 'Contact', href: '/contact', icon: 'Phone' },
  ];

  // Role-based navigation for authenticated users
  const getAuthenticatedNavigation = (userRole: string): NavigationItem[] => {
    const baseNavigation: NavigationItem[] = [
      { name: 'Dashboard', href: `/${userRole}/dashboard`, icon: 'Home', roles: ['customer', 'worker', 'admin', 'bin_owner'] },
    ];

    const roleSpecificNav = {
      customer: [
        { name: 'My Bins', href: '/customer/bins', icon: 'Package' },
        { name: 'Schedule Pickup', href: '/customer/schedule', icon: 'Calendar' },
        { name: 'Pickup History', href: '/customer/history', icon: 'BarChart3' },
        { name: 'Payments', href: '/customer/payments', icon: 'CreditCard' },
        { name: 'Find Workers', href: '/customer/workers', icon: 'Users' },
      ],
      bin_owner: [
        { name: 'My Bins', href: '/bin-owner/bins', icon: 'Package' },
        { name: 'Monitoring', href: '/bin-owner/monitoring', icon: 'BarChart3' },
        { name: 'Schedules', href: '/bin-owner/schedules', icon: 'Calendar' },
        { name: 'Workers', href: '/bin-owner/workers', icon: 'Users' },
        { name: 'Billing', href: '/bin-owner/billing', icon: 'CreditCard' },
      ],
      worker: [
        { name: 'Jobs', href: '/worker/jobs', icon: 'Briefcase' },
        { name: 'Routes', href: '/worker/routes', icon: 'MapPin' },
        { name: 'Earnings', href: '/worker/earnings', icon: 'TrendingUp' },
        { name: 'Performance', href: '/worker/performance', icon: 'BarChart3' },
      ],
      admin: [
        { name: 'User Management', href: '/admin/users', icon: 'Users' },
        { name: 'System Analytics', href: '/admin/analytics', icon: 'BarChart3' },
        { name: 'Service Areas', href: '/admin/areas', icon: 'MapPin' },
        { name: 'Financial Overview', href: '/admin/finance', icon: 'CreditCard' },
        { name: 'Platform Settings', href: '/admin/settings', icon: 'Settings' },
      ],
    };

    return [...baseNavigation, ...(roleSpecificNav[userRole as keyof typeof roleSpecificNav] || [])];
  };

  const navigation = user ? getAuthenticatedNavigation(user.role) : publicNavigation;

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProfileDropdownToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout logic
      localStorage.removeItem('klynaa_user');
      localStorage.removeItem('klynaa_token');
      router.push('/');
    }
  };

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Icon name="Shield" className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Icon name="Shield" className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <Icon name="Shield" className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!mounted) return null;

  return (
    <nav className="bg-white dark:bg-neutral-900 shadow-lg border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href={user ? `/${user.role}/dashboard` : '/'}
              className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <Icon name="Truck" className="w-8 h-8" />
              <span className="text-xl font-bold text-neutral-900 dark:text-white">Klynaa</span>
              {user && (
                <span className="hidden sm:block text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full capitalize ml-2">
                  {user.role === 'bin_owner' ? 'Bin Owner' : user.role}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {/* Navigation Links */}
            {navigation.slice(0, user ? 5 : 6).map((item) => {
              const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon name={item.icon as any} className="w-4 h-4" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* User Profile Section or Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-4 border-l border-neutral-200 dark:border-neutral-700 pl-6 ml-6">
                {/* Notifications */}
                <button className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Icon name="Bell" className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Theme Toggle */}
                <WorkingThemeToggle />

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={handleProfileDropdownToggle}
                    className="flex items-center gap-2 p-2 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <Icon name="User" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium hidden xl:block">{user.name}</span>
                    {getVerificationBadge(user.verification_status)}
                    <Icon name="ChevronDown" className="w-4 h-4" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-2">
                      <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        <Icon name="User" className="w-4 h-4" />
                        Profile
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        <Icon name="Settings" className="w-4 h-4" />
                        Settings
                      </Link>

                      {user.role === 'worker' && (
                        <Link
                          href="/worker/schedule"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        >
                          <Icon name="Calendar" className="w-4 h-4" />
                          Schedule
                        </Link>
                      )}

                      <div className="border-t border-neutral-200 dark:border-neutral-700 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Icon name="LogOut" className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l border-neutral-200 dark:border-neutral-700 pl-6 ml-6">
                <ThemeToggle />
                <Link
                  href="/auth/login"
                  className="text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={handleMobileMenuToggle}
            >
              {isMobileMenuOpen ? <Icon name="X" className="w-6 h-6" /> : <Icon name="Menu" className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon name={item.icon as any} className="w-5 h-5" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {user ? (
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <Icon name="User" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                  </div>
                  {getVerificationBadge(user.verification_status)}
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
                >
                  <Icon name="User" className="w-5 h-5" />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg"
                >
                  <Icon name="Settings" className="w-5 h-5" />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Icon name="LogOut" className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}