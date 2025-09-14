import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores';

interface PrivateRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'worker' | 'customer';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Give time for zustand to rehydrate from localStorage
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading) return; // Don't redirect while loading

        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            console.log('PrivateRoute: Not authenticated, redirecting to login');
            router.push('/auth/login');
            return;
        }

        // Check role-based access
        if (requiredRole && user?.role !== requiredRole) {
            console.log(`PrivateRoute: User role ${user?.role} does not match required role ${requiredRole}`);
            // Redirect to appropriate dashboard based on user role
            const dashboardMap = {
                admin: '/admin/dashboard',
                worker: '/worker/dashboard',
                customer: '/customer/dashboard'
            };
            router.push(dashboardMap[user?.role as keyof typeof dashboardMap] || '/dashboard');
            return;
        }
    }, [isAuthenticated, user, requiredRole, router, isLoading]);

    // Show loading while checking authentication
    if (isLoading || !isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default PrivateRoute;
