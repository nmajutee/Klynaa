import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface WorkerLayoutProps {
  sidebar: React.ReactNode; // Left pane content (filters, lists)
  children: React.ReactNode; // Main map/content area
  className?: string;
}

// Responsive layout: desktop => two-pane; mobile => stacked with bottom nav
const WorkerLayout: React.FC<WorkerLayoutProps> = ({ sidebar, children, className = '' }) => {
  const router = useRouter();
  const navItems = [
    { href: '/worker/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/worker/pickups', label: 'Pickups', icon: '📋' },
    { href: '/worker/map', label: 'Map', icon: '🗺️' },
    { href: '/worker/earnings', label: 'Earnings', icon: '💰' },
    { href: '/worker/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[420px] flex-shrink-0 flex-col border-r bg-white/70 backdrop-blur-sm overflow-y-auto">
          {sidebar}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.map(item => {
            const active = router.pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center text-xs ${active ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                <span className="text-xl mb-1">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default WorkerLayout;
