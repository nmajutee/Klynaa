import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DashboardDemo() {
  const router = useRouter();

  useEffect(() => {
    // Set demo worker user in localStorage
    const demoWorker = {
      id: 'worker-1',
      email: 'jane.smith@klynaa.com',
      name: 'Jane Smith',
      role: 'worker',
      verification_status: 'verified'
    };

    localStorage.setItem('klynaa_user', JSON.stringify(demoWorker));

    // Redirect to worker dashboard
    router.push('/worker/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-klynaa-lightgray flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-klynaa-dark mb-4">Setting up demo...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-klynaa-primary mx-auto"></div>
      </div>
    </div>
  );
}