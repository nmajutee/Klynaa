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
    '/auth/reset-password'
  ].includes(router.pathname) || router.pathname.startsWith('/auth/register/');

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