import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DemoAdmin() {
  const router = useRouter();

  useEffect(() => {
    // Set demo admin user in localStorage
    const demoAdmin = {
      id: 'admin-1',
      email: 'admin@klynaa.com',
      name: 'Admin User',
      role: 'admin'
    };

    localStorage.setItem('klynaa_user', JSON.stringify(demoAdmin));

    // Redirect to admin dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-klynaa-lightgray flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-klynaa-dark mb-4">Setting up admin demo...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-klynaa-primary mx-auto"></div>
      </div>
    </div>
  );
}