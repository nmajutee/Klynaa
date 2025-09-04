import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores';

interface PrivateRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'worker' | 'customer';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        // Check role-based access
        if (requiredRole && user?.role !== requiredRole) {
            // Redirect to dashboard if user doesn't have required role
            router.push('/dashboard');
            return;
        }
    }, [isAuthenticated, user, requiredRole, router]);

    // Show loading while checking authentication
    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default PrivateRoute;
