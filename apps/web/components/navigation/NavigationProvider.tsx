import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import Navigation from './Navigation';

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Don't show navigation on certain pages
  const hideNavigation = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    // Dashboard pages have their own sidebar navigation
    '/admin/dashboard',
    '/worker/dashboard',
    '/bin-owner/dashboard',
    '/customer/dashboard'
  ].includes(router.pathname) ||
  router.pathname.startsWith('/auth/register/') ||
  router.pathname.startsWith('/admin/') ||
  router.pathname.startsWith('/worker/') ||
  router.pathname.startsWith('/bin-owner/') ||
  router.pathname.startsWith('/customer/');

  // Show nothing during initial auth loading to prevent flash
  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <>
      {!hideNavigation && (
        <Navigation user={user} onLogout={logout} />
      )}
      {children}
    </>
  );
}