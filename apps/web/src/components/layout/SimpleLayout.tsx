import React from 'react';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

/**
 * Simple layout for pages that only need basic structure without sidebar navigation
 * Used for pages that have their own navigation via PublicNavbar or AuthenticatedNavbar
 */
export default function SimpleLayout({ children }: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  );
}