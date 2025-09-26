import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '../../../components/ui/Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../ui/ThemeToggle';
import VerificationBadge, { getVerificationStatus } from '../VerificationBadge';

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'worker' | 'customer' | 'bin_owner';
  verification_status?: 'verified' | 'pending' | 'rejected';
}

interface AuthenticatedNavbarProps {
  onVerificationClick?: () => void;
}

export default function AuthenticatedNavbar({ onVerificationClick }: AuthenticatedNavbarProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('klynaa_user');
    router.push('/auth/login');
  };

  const getRoleConfig = (role: string) => {
    // Use fallback text for SSR compatibility
    const fallbackNames = {
      'worker': 'Worker',
      'customer': 'Customer',
      'bin_owner': 'Bin Owner'
    };

    switch (role) {
      case 'worker':
        return {
          name: mounted ? t('role.worker', 'Worker') : fallbackNames.worker,
          color: 'text-emerald-600 bg-emerald-100',
          dashboardPath: '/worker/dashboard',
          navigation: [
            { name: mounted ? t('nav.dashboard', 'Dashboard') : 'Dashboard', href: '/worker/dashboard', icon: 'Home' },
            { name: mounted ? t('nav.pickups', 'Pickups') : 'Pickups', href: '/worker/pickups', icon: 'MapPin' },
            { name: mounted ? t('nav.earnings', 'Earnings') : 'Earnings', href: '/worker/earnings', icon: 'DollarSign' },
          ]
        };
      case 'customer':
        return {
          name: mounted ? t('role.customer', 'Customer') : fallbackNames.customer,
          color: 'text-blue-600 bg-blue-100',
          dashboardPath: '/bin-owner/dashboard',
          navigation: [
            { name: mounted ? t('nav.dashboard', 'Dashboard') : 'Dashboard', href: '/bin-owner/dashboard', icon: 'Home' },
            { name: mounted ? t('nav.bins', 'My Bins') : 'My Bins', href: '/customer/bins', icon: 'Truck' },
            { name: mounted ? t('nav.pickups', 'Pickups') : 'Pickups', href: '/customer/pickups', icon: 'MapPin' },
          ]
        };
      case 'bin_owner':
        return {
          name: mounted ? t('role.bin_owner', 'Bin Owner') : fallbackNames.bin_owner,
          color: 'text-purple-600 bg-purple-100',
          dashboardPath: '/bin-owner/dashboard',
          navigation: [
            { name: mounted ? t('nav.dashboard', 'Dashboard') : 'Dashboard', href: '/bin-owner/dashboard', icon: 'Home' },
            { name: mounted ? t('nav.analytics', 'Analytics') : 'Analytics', href: '/bin-owner/analytics', icon: 'BarChart3' },
            { name: mounted ? t('nav.settings', 'Settings') : 'Settings', href: '/bin-owner/settings', icon: 'Settings' },
          ]
        };
      default:
        return {
          name: 'User',
          color: 'text-neutral-600 bg-neutral-100',
          dashboardPath: '/dashboard',
          navigation: []
        };
    }
  };

  if (!user) {
    return null;
  }

  const roleConfig = getRoleConfig(user.role);

  return (
    <nav className="bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href={roleConfig.dashboardPath}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Icon name="Truck" className="w-8 h-8" />
              <span className="text-xl font-bold text-neutral-900 dark:text-white">Klynaa</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {/* Navigation Links */}
            <div className="flex space-x-6">
              {roleConfig.navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                        : 'text-neutral-700 hover:text-emerald-600 hover:border-b-2 hover:border-emerald-200'
                    } px-1 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent flex items-center gap-2`}
                  >
                    <Icon name={item.icon as any} size={16 as any} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Verification Badge */}
              <VerificationBadge
                status={getVerificationStatus(user)}
                onClick={() => {
                  if (getVerificationStatus(user) !== 'verified' && onVerificationClick) {
                    onVerificationClick();
                  }
                }}
              />

              {/* Notifications */}
              <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                <Icon name="Bell" size={20 as any} />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm rounded-lg p-2 hover:bg-neutral-100 transition-colors"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="User" className="w-5 h-5 text-neutral-600" />
                    <span className="font-medium text-neutral-900 max-w-32 truncate">{user.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}>
                      {roleConfig.name}
                    </span>
                  </div>
                  <Icon name="ChevronDown" size={16 as any} className="text-neutral-500" />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                      <p className="text-sm text-neutral-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Icon name="User" size={16 as any} />
                      {mounted ? t('auth.profile', 'Profile Settings') : 'Profile Settings'}
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Icon name="Settings" size={16 as any} />
                      {mounted ? t('auth.account', 'Account Settings') : 'Account Settings'}
                    </Link>

                    <hr className="my-2 border-neutral-100" />

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <Icon name="LogOut" size={16 as any} />
                      {mounted ? t('auth.logout', 'Sign Out') : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-neutral-700 hover:text-emerald-600 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <Icon name="X" size={24 as any} /> : <Icon name="Menu" size={24 as any} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-neutral-200">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-neutral-100 mb-2">
              <div className="flex items-center gap-3">
                <Icon name="User" className="w-8 h-8 text-neutral-600" />
                <div>
                  <p className="font-medium text-neutral-900">{user.name}</p>
                  <p className="text-sm text-neutral-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}>
                  {roleConfig.name}
                </span>
              </div>
            </div>

            {/* Theme Toggle - Mobile */}
            <div className="flex justify-end px-3 py-2 border-b border-neutral-100">
              <ThemeToggle />
            </div>

            {/* Verification Badge - Mobile */}
            <div className="px-3 py-2">
              <VerificationBadge
                status={getVerificationStatus(user)}
                onClick={() => {
                  if (getVerificationStatus(user) !== 'verified' && onVerificationClick) {
                    onVerificationClick();
                    setIsMobileMenuOpen(false);
                  }
                }}
              />
            </div>

            {/* Navigation Links */}
            {roleConfig.navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-neutral-700 hover:text-emerald-600 hover:bg-neutral-50'
                  } flex items-center gap-3 px-3 py-2 text-base font-medium rounded-lg transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name={item.icon as any} size={20 as any} />
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon name="User" size={20 as any} />
                {mounted ? t('auth.profile', 'Profile Settings') : 'Profile Settings'}
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon name="Settings" size={20 as any} />
                {mounted ? t('auth.account', 'Account Settings') : 'Account Settings'}
              </Link>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
              >
                <Icon name="LogOut" size={20 as any} />
                {mounted ? t('auth.logout', 'Sign Out') : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click away overlay for dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
}