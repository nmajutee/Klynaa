import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import SimpleLayout from './SimpleLayout';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'worker' | 'customer' | 'bin_owner' | 'admin';
  verification_status?: 'verified' | 'pending' | 'rejected';
}

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Pages that use the complex sidebar layout
const sidebarLayoutPages = [
  // Admin pages
  '/dashboard',
  '/bins',
  '/pickups',
  '/users',
  '/analytics',
  '/settings',
  // Worker pages that need sidebar
  '/pickups/available',
  '/pickups/mine',
  // Pages that explicitly need sidebar
  '/profile'
];

// Pages that should use simple layout (most pages)
const simpleLayoutPages = [
  // Auth pages
  '/auth/login',
  '/auth/register',
  '/auth/register/worker',
  '/auth/register/customer',
  '/auth/register/bin-owner',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/verify-phone',
  // Public pages
  '/',
  '/about',
  '/features',
  '/contact',
  '/pricing',
  '/how-it-works',
  // Role-specific dashboard pages (these have their own navigation)
  '/worker/dashboard',
  '/worker/pickups',
  '/worker/earnings',
  '/bin-owner/dashboard',
  '/bin-owner/analytics',
  '/bin-owner/settings'
];

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('klynaa_user');
      }
    }
  }, []);

  // Determine which layout to use
  const useSimpleLayout = simpleLayoutPages.includes(router.pathname);
  const useSidebarLayout = sidebarLayoutPages.includes(router.pathname);

  // Default to simple layout for most cases
  if (useSimpleLayout || (!useSidebarLayout && !user?.role)) {
    return <SimpleLayout>{children}</SimpleLayout>;
  }

  // Use sidebar layout for admin or specific pages
  if (useSidebarLayout || user?.role === 'admin') {
    return <Layout>{children}</Layout>;
  }

  // Default to simple layout
  return <SimpleLayout>{children}</SimpleLayout>;
}