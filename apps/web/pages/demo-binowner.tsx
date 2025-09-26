import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DemoBinOwner() {
  const router = useRouter();

  useEffect(() => {
    // Set demo bin owner user in localStorage
    const demoBinOwner = {
      id: 'binowner-1',
      email: 'john.doe@klynaa.com',
      name: 'John Doe',
      role: 'bin-owner'
    };

    localStorage.setItem('klynaa_user', JSON.stringify(demoBinOwner));

    // Redirect to bin owner dashboard
    router.push('/bin-owner/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-klynaa-lightgray flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-klynaa-dark mb-4">Setting up bin owner demo...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-klynaa-primary mx-auto"></div>
      </div>
    </div>
  );
}